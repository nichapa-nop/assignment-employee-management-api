import { ConfigType } from '@nestjs/config';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import databaseConfig from '../config/database.config';

/**
 * Shared connection options for both the Nest runtime and the TypeORM CLI,
 * so migrations always run against the same configuration as the app.
 */
export function buildDataSourceOptions(
  config: ConfigType<typeof databaseConfig>,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    logging: config.logging,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    // Schema changes must go through migrations only.
    synchronize: false,
  };
}
