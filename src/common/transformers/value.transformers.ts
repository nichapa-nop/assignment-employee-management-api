import { TransformFnParams } from 'class-transformer';

/** Trims strings; other values are returned unchanged for the validators to reject. */
export function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Parses "true"/"false" query strings. Implicit conversion would turn any
 * non-empty string (including "false") into true, so it is done explicitly.
 */
export function toBoolean({ value }: TransformFnParams): unknown {
  if (value === 'true' || value === true) {
    return true;
  }
  if (value === 'false' || value === false) {
    return false;
  }
  return value;
}
