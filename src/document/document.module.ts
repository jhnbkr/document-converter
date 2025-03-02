import { Module } from '@nestjs/common';

import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import {
  JsonDocumentTransformer,
  X12DocumentTransformer,
  XmlDocumentTransformer,
} from './transformer/providers';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    JsonDocumentTransformer,
    X12DocumentTransformer,
    XmlDocumentTransformer,
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
