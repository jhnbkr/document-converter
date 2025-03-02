import { Injectable, Logger } from '@nestjs/common';

import { DocumentError } from './errors';
import {
  DocumentTransformer,
  DocumentTransformerOptions,
} from './transformer/interfaces';
import {
  JsonDocumentTransformer,
  X12DocumentTransformer,
  XmlDocumentTransformer,
} from './transformer/providers';
import { DOCUMENT_CONTENT_TYPE, DocumentContentType } from './types';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly transformers: Record<
    DocumentContentType,
    DocumentTransformer
  >;

  constructor(
    private readonly jsonTransformer: JsonDocumentTransformer,
    private readonly x12Transformer: X12DocumentTransformer,
    private readonly xmlTransformer: XmlDocumentTransformer,
  ) {
    this.transformers = {
      [DOCUMENT_CONTENT_TYPE.APPLICATION_JSON]: this.jsonTransformer,
      [DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12]: this.x12Transformer,
      [DOCUMENT_CONTENT_TYPE.APPLICATION_XML]: this.xmlTransformer,
    };
  }

  public getTransformer(contentType: DocumentContentType): DocumentTransformer {
    const transformer = this.transformers[contentType];
    if (!transformer) {
      throw new DocumentError(`Unsupported content type: ${contentType}`);
    }
    return transformer;
  }

  public convert(
    content: unknown,
    fromContentType: DocumentContentType,
    toContentType: DocumentContentType,
    options: DocumentTransformerOptions,
  ): string {
    this.logger.log(
      `Converting document from ${fromContentType} to ${toContentType}`,
    );
    const fromTransformer = this.getTransformer(fromContentType);
    const document = fromTransformer.parse(content, options);

    const toTransformer = this.getTransformer(toContentType);
    return toTransformer.serialize(document, options);
  }
}
