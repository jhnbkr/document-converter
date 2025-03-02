import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  Version,
} from '@nestjs/common';
import { Response } from 'express';

import { ValidationError } from '@common/errors';
import { parseDto } from '@common/utils';

import { DocumentService } from './document.service';
import { DocumentConvertHeadersDto, DocumentConvertOptionsDto } from './dto';
import { DocumentError } from './errors';
import { DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS } from './transformer/types';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Version('1')
  @Post('convert')
  @HttpCode(HttpStatus.OK)
  convert(
    @Headers() headers: Record<string, string>,
    @Query() options: DocumentConvertOptionsDto,
    @Body() content: unknown,
    @Res() response: Response,
  ) {
    try {
      const { 'content-type': fromContentType, accept: toContentType } =
        parseDto(headers, DocumentConvertHeadersDto);

      const filteredOptions = Object.fromEntries(
        Object.entries(options).filter(([_, value]) => value !== undefined),
      );

      const result = this.documentService.convert(
        content,
        fromContentType,
        toContentType,
        {
          ...DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS,
          ...filteredOptions,
        },
      );

      response.setHeader('Content-Type', toContentType);
      response.send(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.errors);
      }

      if (error instanceof DocumentError) {
        throw new BadRequestException([error.message]);
      }

      throw error;
    }
  }
}
