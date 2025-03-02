import { Injectable } from '@nestjs/common';

import { ValidationError } from '@common/errors';
import { parseSchema } from '@common/utils';
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
  DEFAULT_ELEMENT_SEPARATOR,
  DEFAULT_SEGMENT_SEPARATOR,
} from '../../types';

@Injectable()
export class X12DocumentTransformer implements DocumentTransformer {
  public readonly contentType = DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12;

  public parse(
    content: unknown,
    options: DocumentTransformerOptions = {},
  ): Document {
    try {
      if (!content || typeof content !== 'string') {
        throw new ValidationError('Invalid X12 content, expected a string');
      }

      const { segmentSeparator, elementSeparator } =
        this.resolveSeparators(options);

      const segments = content
        .split(segmentSeparator)
        .map((segment) => segment.replace(/\n/g, '').trim())
        .filter(Boolean)
        .map((segment) => {
          const [name, ...values] = segment.split(elementSeparator);
          return {
            name,
            elements: values.map((value) => ({
              value: options.trimElements ? value.trim() : value,
            })),
          };
        });

      return { segments };
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

      const { segmentSeparator, elementSeparator } =
        this.resolveSeparators(options);

      const segments = document.segments.map((segment) => {
        const { name, elements } = segment;
        return (
          [
            name,
            ...elements.map((element) =>
              options.trimElements ? element.value.trim() : element.value,
            ),
          ].join(elementSeparator) + segmentSeparator
        );
      });

      return segments.join(options.format ? '\n' : '');
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new DocumentTransformerError(error.message, error);
      }
      throw new DocumentTransformerError('Unexpected error', error);
    }
  }

  private resolveSeparators(options?: DocumentTransformerOptions): {
    segmentSeparator: string;
    elementSeparator: string;
  } {
    const segmentSeparator =
      options?.segmentSeparator ?? DEFAULT_SEGMENT_SEPARATOR;
    const elementSeparator =
      options?.elementSeparator ?? DEFAULT_ELEMENT_SEPARATOR;

    if (segmentSeparator === elementSeparator) {
      throw new ValidationError(
        `Segment and element separators cannot be the same: ${segmentSeparator}`,
      );
    }

    return { segmentSeparator, elementSeparator };
  }
}
