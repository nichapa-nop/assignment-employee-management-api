import { Department } from '../../modules/departments/enums/department.enum';
import {
  EMPLOYEE_NAME_MAX_LENGTH,
  EMPLOYEE_SALARY_MAX,
} from '../../modules/employees/employee.constants';
import { SheetRow } from './worksheet.reader';

/** Column headers used in the source Excel file. */
export const EMPLOYEE_SHEET_HEADERS = {
  id: 'ID',
  name: 'Name',
  department: 'Department',
  salary: 'Salary',
  joinDate: 'Join Date',
  status: 'Status',
  lastUpdatedDate: 'Last Updated Date',
} as const;

export interface EmployeeSeedRecord {
  id: number;
  name: string;
  department: Department;
  salary: number;
  joinDate: string;
  isActive: boolean;
  updatedAt: Date;
}

const DEPARTMENTS: string[] = Object.values(Department);

class SeedRowError extends Error {
  constructor(rowNumber: number, column: string, reason: string) {
    super(`Row ${rowNumber}, column "${column}": ${reason}`);
  }
}

function parseId(value: unknown, rowNumber: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new SeedRowError(
      rowNumber,
      EMPLOYEE_SHEET_HEADERS.id,
      'must be a positive integer',
    );
  }
  return value;
}

function parseName(value: unknown, rowNumber: number): string {
  const name = typeof value === 'string' ? value.trim() : '';
  if (name.length === 0 || name.length > EMPLOYEE_NAME_MAX_LENGTH) {
    throw new SeedRowError(
      rowNumber,
      EMPLOYEE_SHEET_HEADERS.name,
      `must be 1-${EMPLOYEE_NAME_MAX_LENGTH} characters`,
    );
  }
  return name;
}

function parseDepartment(value: unknown, rowNumber: number): Department {
  const department = typeof value === 'string' ? value.trim() : '';
  if (!DEPARTMENTS.includes(department)) {
    throw new SeedRowError(
      rowNumber,
      EMPLOYEE_SHEET_HEADERS.department,
      `must be one of ${DEPARTMENTS.join(', ')}`,
    );
  }
  return department as Department;
}

function parseSalary(value: unknown, rowNumber: number): number {
  const salary =
    typeof value === 'number' ? Math.round(value * 100) / 100 : Number.NaN;
  if (!Number.isFinite(salary) || salary < 0 || salary > EMPLOYEE_SALARY_MAX) {
    throw new SeedRowError(
      rowNumber,
      EMPLOYEE_SHEET_HEADERS.salary,
      `must be a number between 0 and ${EMPLOYEE_SALARY_MAX}`,
    );
  }
  return salary;
}

function parseDate(value: unknown, rowNumber: number, column: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new SeedRowError(rowNumber, column, 'must be a valid date');
  }
  return value;
}

/** Excel dates carry no time zone; exceljs exposes them as UTC midnight. */
function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Accepts "Active" and "Inactive", including the "In Active" spelling in the source file. */
function parseStatus(value: unknown, rowNumber: number): boolean {
  const status =
    typeof value === 'string' ? value.replace(/\s+/g, '').toLowerCase() : '';
  if (status === 'active') {
    return true;
  }
  if (status === 'inactive') {
    return false;
  }
  throw new SeedRowError(
    rowNumber,
    EMPLOYEE_SHEET_HEADERS.status,
    'must be "Active" or "Inactive"',
  );
}

function parseRow({ rowNumber, values }: SheetRow): EmployeeSeedRecord {
  const headers = EMPLOYEE_SHEET_HEADERS;

  return {
    id: parseId(values[headers.id], rowNumber),
    name: parseName(values[headers.name], rowNumber),
    department: parseDepartment(values[headers.department], rowNumber),
    salary: parseSalary(values[headers.salary], rowNumber),
    joinDate: toDateOnlyString(
      parseDate(values[headers.joinDate], rowNumber, headers.joinDate),
    ),
    isActive: parseStatus(values[headers.status], rowNumber),
    updatedAt: parseDate(
      values[headers.lastUpdatedDate],
      rowNumber,
      headers.lastUpdatedDate,
    ),
  };
}

/** Validates and converts sheet rows; throws on the first invalid or duplicate row. */
export function parseEmployeeRows(rows: SheetRow[]): EmployeeSeedRecord[] {
  const seenIds = new Set<number>();

  return rows.map((row) => {
    const record = parseRow(row);
    if (seenIds.has(record.id)) {
      throw new SeedRowError(
        row.rowNumber,
        EMPLOYEE_SHEET_HEADERS.id,
        `duplicate id ${record.id}`,
      );
    }
    seenIds.add(record.id);
    return record;
  });
}
