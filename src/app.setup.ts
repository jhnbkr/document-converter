import { NestExpressApplication } from '@nestjs/platform-express';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as bodyParser from 'body-parser';

import { DOCUMENT_CONTENT_TYPE } from '@document/types';

/**
 * Configures the NestJS application with common middleware and settings
 *
 * This function sets up:
 * - Validation pipe with automatic transformation and property whitelisting
 * - API versioning using URI path versioning
 * - Body parsers for JSON and specific document content types
 *
 * @param app - The NestJS Express application instance to configure
 */
export function configureApp(app: NestExpressApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(bodyParser.json());
  app.use(
    bodyParser.text({
      type: [
        DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12,
        DOCUMENT_CONTENT_TYPE.APPLICATION_XML,
      ],
    }),
  );
}
