import 'reflect-metadata';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import databaseConfig from '../../src/config/database.config';
import { buildDataSourceOptions } from '../../src/database/typeorm.options';
import { TEST_DATABASE } from './test-env';

async function ensureDatabaseExists(): Promise<void> {
  const config = databaseConfig();
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: 'postgres',
  });

  await client.connect();
  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEST_DATABASE],
    );
    if (!rowCount) {
      // template0 avoids failures when template1 has a collation version mismatch.
      await client.query(
        `CREATE DATABASE "${TEST_DATABASE}" TEMPLATE template0`,
      );
    }
  } finally {
    await client.end();
  }
}

async function runMigrations(): Promise<void> {
  const dataSource = new DataSource(buildDataSourceOptions(databaseConfig()));
  await dataSource.initialize();
  try {
    await dataSource.runMigrations();
  } finally {
    await dataSource.destroy();
  }
}

/** Creates the test database if needed and brings its schema up to date. */
export default async function globalSetup(): Promise<void> {
  await ensureDatabaseExists();
  await runMigrations();
}
