import { registerAs } from '@nestjs/config';
import { readFileSync } from 'fs';
import { validateDatabaseEnv } from './env.validation';

function readCaCertificate(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  try {
    return readFileSync(path, 'utf8');
  } catch {
    throw new Error(`Cannot read DB_SSL_CA certificate file: ${path}`);
  }
}

export default registerAs('database', () => {
  const env = validateDatabaseEnv(process.env);

  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    logging: env.DB_LOGGING,
    sslMode: env.DB_SSL_MODE,
    sslCa: readCaCertificate(env.DB_SSL_CA),
  };
});
