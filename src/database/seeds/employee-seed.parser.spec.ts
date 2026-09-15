import { Department } from '../../modules/departments/enums/department.enum';
import {
  EMPLOYEE_SHEET_HEADERS,
  parseEmployeeRows,
} from './employee-seed.parser';
import { SheetRow } from './worksheet.reader';

const headers = EMPLOYEE_SHEET_HEADERS;

function buildRow(
  overrides: Record<string, unknown> = {},
  rowNumber = 2,
): SheetRow {
  return {
    rowNumber,
    values: {
      [headers.id]: 101,
      [headers.name]: 'John Doe',
      [headers.department]: 'Engineering',
      [headers.salary]: 65000,
      [headers.joinDate]: new Date(Date.UTC(2023, 0, 15)),
      [headers.status]: 'Active',
      [headers.lastUpdatedDate]: new Date(Date.UTC(2026, 0, 10)),
      ...overrides,
    },
  };
}

describe('parseEmployeeRows', () => {
  it('converts a valid row into a seed record', () => {
    expect(parseEmployeeRows([buildRow()])).toEqual([
      {
        id: 101,
        name: 'John Doe',
        department: Department.Engineering,
        salary: 65000,
        joinDate: '2023-01-15',
        isActive: true,
        updatedAt: new Date(Date.UTC(2026, 0, 10)),
      },
    ]);
  });

  it.each(['In Active', 'Inactive', ' inactive '])(
    'treats status "%s" as inactive',
    (status) => {
      const [record] = parseEmployeeRows([
        buildRow({ [headers.status]: status }),
      ]);
      expect(record.isActive).toBe(false);
    },
  );

  it('trims the name and rounds salary to 2 decimal places', () => {
    const [record] = parseEmployeeRows([
      buildRow({ [headers.name]: '  Jane  ', [headers.salary]: 1234.567 }),
    ]);

    expect(record.name).toBe('Jane');
    expect(record.salary).toBe(1234.57);
  });

  it.each([
    [headers.department, 'Finance', 'must be one of'],
    [headers.status, 'Pending', 'must be "Active" or "Inactive"'],
    [headers.salary, -1, 'must be a number between 0 and 9999999999.99'],
    [
      headers.salary,
      10_000_000_000,
      'must be a number between 0 and 9999999999.99',
    ],
    [headers.joinDate, '2023-01-15', 'must be a valid date'],
    [headers.name, '', 'must be 1-100 characters'],
    [headers.id, 0, 'must be a positive integer'],
  ])('rejects an invalid "%s" value', (column, value, reason) => {
    expect(() => parseEmployeeRows([buildRow({ [column]: value }, 7)])).toThrow(
      `Row 7, column "${column}": ${reason}`,
    );
  });

  it('rejects duplicate IDs', () => {
    expect(() => parseEmployeeRows([buildRow(), buildRow({}, 3)])).toThrow(
      'Row 3, column "ID": duplicate id 101',
    );
  });
});
