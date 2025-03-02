import { Module } from '@nestjs/common';

import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}
