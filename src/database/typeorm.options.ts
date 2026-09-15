import { ConfigType } from '@nestjs/config';
import { join } from 'path';
import type { TlsOptions } from 'tls';
import { DataSourceOptions } from 'typeorm';
import databaseConfig from '../config/database.config';
import { DatabaseSslMode } from '../config/env.validation';

type DatabaseConfig = ConfigType<typeof databaseConfig>;

/** Maps DB_SSL_MODE to node-postgres TLS options. */
export function buildSslOptions(
  config: Pick<DatabaseConfig, 'sslMode' | 'sslCa'>,
): TlsOptions | false {
  switch (config.sslMode) {
    case DatabaseSslMode.Require:
      return { rejectUnauthorized: false };
    case DatabaseSslMode.VerifyFull:
      return { rejectUnauthorized: true, ca: config.sslCa };
    default:
      return false;
  }
}

/**
 * Shared connection options for both the Nest runtime and the TypeORM CLI,
 * so migrations always run against the same configuration as the app.
 */
export function buildDataSourceOptions(
  config: DatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    ssl: buildSslOptions(config),
    logging: config.logging,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    // Schema changes must go through migrations only.
    synchronize: false,
  };
}
