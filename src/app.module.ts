import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';

import { DocumentModule } from '@document/document.module';

@Module({
  imports: [SentryModule.forRoot(), DocumentModule],
})
export class AppModule {}
