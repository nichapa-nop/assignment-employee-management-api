import { Logger } from '@nestjs/common';
import { join } from 'path';
import { Employee } from '../../modules/employees/entities/employee.entity';
import dataSource from '../data-source';
import { parseEmployeeRows } from './employee-seed.parser';
import { loadWorksheet, readSheetRows } from './worksheet.reader';

const SEED_FILE = join(__dirname, 'data', 'employees.xlsx');
const SEED_SHEET = 'Example Data';
const logger = new Logger('Seed');

/**
 * Imports employees from the source Excel file. Safe to run repeatedly:
 * rows are upserted by ID, so re-running restores the original data
 * (including soft-deleted rows) without creating duplicates.
 */
async function seed(): Promise<void> {
  const worksheet = await loadWorksheet(SEED_FILE, SEED_SHEET);
  const records = parseEmployeeRows(readSheetRows(worksheet));

  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      await manager.upsert(
        Employee,
        records.map((record) => ({ ...record, deletedAt: null })),
        ['id'],
      );

      // Explicit IDs do not advance the identity sequence, so move it past the
      // highest ID to keep newly created employees from colliding.
      await manager.query(
        `SELECT setval(pg_get_serial_sequence('employees', 'id'), GREATEST((SELECT MAX(id) FROM employees), 100))`,
      );
    });

    logger.log(`Seeded ${records.length} employees from "${SEED_SHEET}"`);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  logger.error(
    'Seeding failed',
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});
