import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { configureApp } from './app.setup';

const logger = new Logger('Application');

async function bootstrap() {
  const environment = process.env.NODE_ENV ?? 'development';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port} (env: ${environment})`);
}

bootstrap().catch((err) => {
  logger.error('Application failed to start', err);
  process.exit(1);
});
