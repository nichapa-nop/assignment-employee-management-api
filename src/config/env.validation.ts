// class-transformer reads design:type metadata, so the polyfill must be loaded
// even when this module runs outside Nest (TypeORM CLI, seed scripts, tests).
import 'reflect-metadata';
import {
  ClassConstructor,
  plainToInstance,
  Transform,
} from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/** Variables needed to reach the database (used alone by the TypeORM CLI). */
export class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_DATABASE: string;

  // Implicit conversion turns the string "false" into true, so parse explicitly.
  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    [true, 'true'].includes(obj.DB_LOGGING as boolean | string),
  )
  @IsBoolean()
  DB_LOGGING: boolean = false;
}

/** All variables required to run the HTTP application. */
export class EnvironmentVariables extends DatabaseEnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  @IsNotEmpty()
  API_PREFIX: string = 'api';

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string;
}

function validateAgainst<T extends object>(
  schema: ClassConstructor<T>,
  config: Record<string, unknown>,
): T {
  const validatedConfig = plainToInstance(schema, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Invalid environment variables:\n  - ${details}`);
  }

  return validatedConfig;
}

/**
 * Validates environment variables at startup so the app fails fast
 * with a clear message instead of failing later at runtime.
 */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return validateAgainst(EnvironmentVariables, config);
}

export function validateDatabaseEnv(
  config: Record<string, unknown>,
): DatabaseEnvironmentVariables {
  return validateAgainst(DatabaseEnvironmentVariables, config);
}
