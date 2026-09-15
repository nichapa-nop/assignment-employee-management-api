import { ValueTransformer } from 'typeorm';

/**
 * PostgreSQL returns NUMERIC columns as strings to avoid precision loss.
 * Converts them to numbers for the application; NUMERIC(12,2) values stay
 * well within the safe range of a JavaScript number.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null | undefined) =>
    value === null || value === undefined ? value : Number(value),
};
