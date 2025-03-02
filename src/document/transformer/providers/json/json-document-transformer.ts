import { Injectable } from '@nestjs/common';

import { ValidationError } from '@common/errors';
import { parseJson, parseSchema, stringifyJson } from '@common/utils';
import {
  Document,
  DOCUMENT_CONTENT_TYPE,
  DocumentSchema,
} from '@document/types';

import { DocumentTransformerError } from '../../errors';
import {
  DocumentTransformer,
  DocumentTransformerOptions,
} from '../../interfaces';
import {
  JsonDocument,
  JsonDocumentSchema,
} from './json-document-transformer.types';

@Injectable()
export class JsonDocumentTransformer implements DocumentTransformer {
  public readonly contentType = DOCUMENT_CONTENT_TYPE.APPLICATION_JSON;

  public parse(
    content: unknown,
    options: DocumentTransformerOptions = {},
  ): Document {
    try {
      if (content == null || !['string', 'object'].includes(typeof content)) {
        throw new ValidationError(
          'Invalid JSON content, expected a string or an object',
        );
      }

      const parsedJson =
        typeof content === 'string'
          ? parseJson(content, { errorPrefix: 'Invalid JSON content' })
          : content;

      const jsonDocument = parseSchema(JsonDocumentSchema, parsedJson, {
        errorPrefix: 'Invalid JSON structure',
      });

      return {
        segments: Object.entries(jsonDocument).flatMap(
          ([segmentName, elements]) =>
            elements.map((element) => ({
              name: segmentName,
              elements: Object.values(element).map((value) => ({
                value: options.trimElements ? value.trim() : value,
              })),
            })),
        ),
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new DocumentTransformerError(error.message, error);
      }
      throw new DocumentTransformerError('Unexpected error', error);
    }
  }

  public serialize(
    document: Document,
    options: DocumentTransformerOptions = {},
  ): string {
    try {
      parseSchema(DocumentSchema, document, {
        errorPrefix: 'Invalid document structure',
      });

      const jsonDocument: JsonDocument = document.segments.reduce<JsonDocument>(
        (acc, { name, elements }) => {
          acc[name] = acc[name] || [];
          acc[name].push(
            Object.fromEntries(
              elements.map((element, index) => [
                `${name}${index + 1}`,
                options.trimElements ? element.value.trim() : element.value,
              ]),
            ),
          );
          return acc;
        },
        {},
      );

      return stringifyJson(jsonDocument, {
        format: options?.format,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new DocumentTransformerError(error.message, error);
      }
      throw new DocumentTransformerError('Unexpected error', error);
    }
  }
}
