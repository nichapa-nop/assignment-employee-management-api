import 'dotenv/config';

const TEST_SUFFIX = '_test';

/**
 * Resolves the e2e database: DB_TEST_DATABASE if set, otherwise DB_DATABASE.
 * The "_test" suffix is always enforced because the tests truncate tables.
 * Idempotent, since this module runs both in global setup and in the test
 * environment (where DB_DATABASE has already been switched).
 */
function resolveTestDatabase(): string {
  const database =
    process.env.DB_TEST_DATABASE ?? process.env.DB_DATABASE ?? '';
  return database.endsWith(TEST_SUFFIX) ? database : database + TEST_SUFFIX;
}

export const TEST_DATABASE = resolveTestDatabase();

// ConfigModule does not override variables that already exist in process.env.
process.env.NODE_ENV = 'test';
process.env.DB_DATABASE = TEST_DATABASE;
process.env.DB_LOGGING = 'false';
