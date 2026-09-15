import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import databaseConfig from '../config/database.config';
import { buildDataSourceOptions } from './typeorm.options';

/**
 * DataSource used by the TypeORM CLI (migrations) and standalone scripts (seed).
 * The Nest application connects through DatabaseModule instead.
 */
export default new DataSource(buildDataSourceOptions(databaseConfig()));
