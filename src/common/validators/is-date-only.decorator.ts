import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches } from 'class-validator';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts a real calendar date in `YYYY-MM-DD` format (e.g. rejects 2024-02-30). */
export function IsDateOnly(): PropertyDecorator {
  return applyDecorators(
    Matches(DATE_ONLY_PATTERN, {
      message: ({ property }) => `${property} must be in YYYY-MM-DD format`,
    }),
    IsISO8601(
      { strict: true },
      { message: ({ property }) => `${property} must be a valid date` },
    ),
  );
}
