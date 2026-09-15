import { decimalTransformer } from './decimal.transformer';

describe('decimalTransformer', () => {
  it('converts NUMERIC strings from the database into numbers', () => {
    expect(decimalTransformer.from('65000.00')).toBe(65000);
    expect(decimalTransformer.from('1234.56')).toBe(1234.56);
  });

  it('passes null and undefined through', () => {
    expect(decimalTransformer.from(null)).toBeNull();
    expect(decimalTransformer.from(undefined)).toBeUndefined();
  });

  it('writes numbers unchanged', () => {
    expect(decimalTransformer.to(65000.5)).toBe(65000.5);
  });
});
