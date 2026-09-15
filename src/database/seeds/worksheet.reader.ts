import { CellValue, Workbook, Worksheet } from 'exceljs';

export interface SheetRow {
  rowNumber: number;
  values: Record<string, unknown>;
}

function normalizeCellValue(value: CellValue): unknown {
  if (value === null || typeof value !== 'object' || value instanceof Date) {
    return value;
  }
  if ('result' in value) {
    return value.result;
  }
  if ('richText' in value) {
    return value.richText.map((part) => part.text).join('');
  }
  if ('text' in value) {
    return value.text;
  }
  return value;
}

/** Reads a worksheet into objects keyed by the header text of its first row. */
export function readSheetRows(worksheet: Worksheet): SheetRow[] {
  const headers = new Map<number, string>();
  worksheet.getRow(1).eachCell((cell, column) => {
    headers.set(column, String(normalizeCellValue(cell.value)).trim());
  });

  const rows: SheetRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values: Record<string, unknown> = {};
    headers.forEach((header, column) => {
      values[header] = normalizeCellValue(row.getCell(column).value);
    });
    rows.push({ rowNumber, values });
  });

  return rows;
}

export async function loadWorksheet(
  filePath: string,
  sheetName: string,
): Promise<Worksheet> {
  const workbook = new Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) {
    throw new Error(`Worksheet "${sheetName}" not found in ${filePath}`);
  }
  return worksheet;
}
