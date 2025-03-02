import { Injectable } from '@nestjs/common';

import { ValidationError } from '@common/errors';
import { parseSchema, parseXml, stringifyXml } from '@common/utils';
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
  DEFAULT_XML_ENCODING,
  DEFAULT_XML_VERSION,
} from './xml-document-transformer.constants';
import {
  XmlDocument,
  XmlDocumentSchema,
} from './xml-document-transformer.types';

@Injectable()
export class XmlDocumentTransformer implements DocumentTransformer {
  public readonly contentType = DOCUMENT_CONTENT_TYPE.APPLICATION_XML;

  public parse(
    content: unknown,
    options: DocumentTransformerOptions = {},
  ): Document {
    try {
      if (!content || typeof content !== 'string') {
        throw new ValidationError('Invalid XML content, expected a string');
      }

      const parsedXml = parseXml(content, {
        errorPrefix: 'Invalid XML content',
        parser: {
          ignoreAttributes: true,
          ignoreDeclaration: true,
          parseTagValue: false,
          isArray: (_name, jpath) => /^root\.[^.]+$/.test(jpath),
        },
      });

      const xmlDocument = parseSchema(XmlDocumentSchema, parsedXml, {
        errorPrefix: 'Invalid XML structure',
      });

      return {
        segments: Object.entries(xmlDocument.root).flatMap(
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

      const xmlDocument = {
        root: document.segments.reduce<XmlDocument['root']>(
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
        ),
      };

      return stringifyXml(xmlDocument, {
        declaration: {
          version: DEFAULT_XML_VERSION,
          encoding: DEFAULT_XML_ENCODING,
        },
        format: options.format,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new DocumentTransformerError(error.message, error);
      }
      throw new DocumentTransformerError('Unexpected error', error);
    }
  }
}
