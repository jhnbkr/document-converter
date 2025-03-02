import { Document, DocumentContentType } from '@document/types';

export interface DocumentTransformerOptions {
  elementSeparator?: string;
  segmentSeparator?: string;
  format?: boolean;
  trimElements?: boolean;
}

export interface DocumentTransformer {
  readonly contentType: DocumentContentType;
  parse(content: unknown, options: DocumentTransformerOptions): Document;
  serialize(document: Document, options: DocumentTransformerOptions): string;
}
