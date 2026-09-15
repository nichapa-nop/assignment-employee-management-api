import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import appConfig from './config/app.config';

/**
 * Applies global HTTP behaviour. Shared by main.ts and e2e tests so both
 * run the application with identical settings.
 */
export function configureApp(app: INestApplication): void {
  const { apiPrefix, corsOrigins } = app.get<ConfigType<typeof appConfig>>(
    appConfig.KEY,
  );

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({ origin: corsOrigins });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
}

export function setupSwagger(app: INestApplication): void {
  const { apiPrefix } = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Employee Management API')
      .setDescription('RESTful API for managing employee records')
      .setVersion('1.0')
      .build(),
  );

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
}
