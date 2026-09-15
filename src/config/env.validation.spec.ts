import { validateDatabaseEnv, validateEnv } from './env.validation';

const databaseEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5433',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_DATABASE: 'employee_management',
};

const appEnv = { ...databaseEnv, CORS_ORIGIN: 'http://localhost:3000' };

describe('validateEnv', () => {
  it('converts numeric strings and applies defaults', () => {
    const env = validateEnv(appEnv);

    expect(env.DB_PORT).toBe(5433);
    expect(env.PORT).toBe(3001);
    expect(env.API_PREFIX).toBe('api');
    expect(env.DB_LOGGING).toBe(false);
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('parses DB_LOGGING=%s as %s', (value, expected) => {
    expect(validateEnv({ ...appEnv, DB_LOGGING: value }).DB_LOGGING).toBe(
      expected,
    );
  });

  it('rejects a missing CORS_ORIGIN', () => {
    expect(() => validateEnv(databaseEnv)).toThrow(
      'CORS_ORIGIN should not be empty',
    );
  });

  it('rejects a non-numeric DB_PORT', () => {
    expect(() => validateEnv({ ...appEnv, DB_PORT: 'abc' })).toThrow(
      'DB_PORT must be an integer number',
    );
  });
});

describe('validateDatabaseEnv', () => {
  it('accepts database variables without HTTP settings', () => {
    expect(validateDatabaseEnv(databaseEnv).DB_DATABASE).toBe(
      'employee_management',
    );
  });
});
