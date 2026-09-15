import { TransformFnParams } from 'class-transformer';
import { toBoolean, trimString } from './value.transformers';

const params = (value: unknown) => ({ value }) as TransformFnParams;

describe('value transformers', () => {
  describe('toBoolean', () => {
    it.each([
      ['true', true],
      ['false', false],
      [true, true],
      [false, false],
    ])('converts %p to %p', (input, expected) => {
      expect(toBoolean(params(input))).toBe(expected);
    });

    it('leaves other values unchanged for validation to reject', () => {
      expect(toBoolean(params('yes'))).toBe('yes');
      expect(toBoolean(params(['true']))).toEqual(['true']);
    });
  });

  describe('trimString', () => {
    it('trims strings', () => {
      expect(trimString(params('  John  '))).toBe('John');
    });

    it('leaves non-strings unchanged', () => {
      expect(trimString(params(42))).toBe(42);
      expect(trimString(params(null))).toBeNull();
    });
  });
});
