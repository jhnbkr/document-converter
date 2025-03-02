import { IsEnum } from 'class-validator';
import { DOCUMENT_CONTENT_TYPE, DocumentContentType } from '../types';

export class DocumentConvertHeadersDto {
  @IsEnum(DOCUMENT_CONTENT_TYPE, {
    message: `Invalid Content-Type header. Must be one of: ${Object.values(DOCUMENT_CONTENT_TYPE).join(', ')}`,
  })
  'content-type'!: DocumentContentType;

  @IsEnum(DOCUMENT_CONTENT_TYPE, {
    message: `Invalid Accept header. Must be one of: ${Object.values(DOCUMENT_CONTENT_TYPE).join(', ')}`,
  })
  accept!: DocumentContentType;

  [key: string]: string;
}
