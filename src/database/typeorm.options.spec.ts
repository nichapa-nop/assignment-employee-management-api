import { DatabaseSslMode } from '../config/env.validation';
import { buildSslOptions } from './typeorm.options';

describe('buildSslOptions', () => {
  it('disables TLS by default', () => {
    expect(
      buildSslOptions({ sslMode: DatabaseSslMode.Disable, sslCa: undefined }),
    ).toBe(false);
  });

  it('encrypts without certificate verification in require mode', () => {
    expect(
      buildSslOptions({ sslMode: DatabaseSslMode.Require, sslCa: undefined }),
    ).toEqual({ rejectUnauthorized: false });
  });

  it('verifies the server certificate against the CA in verify-full mode', () => {
    expect(
      buildSslOptions({
        sslMode: DatabaseSslMode.VerifyFull,
        sslCa: '-----BEGIN CERTIFICATE-----',
      }),
    ).toEqual({ rejectUnauthorized: true, ca: '-----BEGIN CERTIFICATE-----' });
  });
});
