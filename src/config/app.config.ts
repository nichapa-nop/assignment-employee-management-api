import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.validation';

export default registerAs('app', () => {
  const env = validateEnv(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    corsOrigins: env.CORS_ORIGIN.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
});
