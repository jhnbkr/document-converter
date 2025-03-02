import { XMLBuilder, XmlBuilderOptions } from 'fast-xml-parser';

import { ValidationError } from '../errors';

export interface XmlDeclaration {
  version?: string;
  encoding?: string;
}

export interface StringifyXmlOptions {
  /**
   * Format output with indentation and line breaks
   * @default false
   */
  format?: boolean;

  /**
   * Number of spaces for indentation when format is true
   * @default 2
   */
  indent?: number;

  /**
   * XML Declaration options
   * @example { version: '1.0', encoding: 'UTF-8' }
   */
  declaration?: XmlDeclaration;

  /**
   * XML Builder options
   * @see XmlBuilderOptions
   */
  builder?: Omit<XmlBuilderOptions, 'format' | 'indentBy'>;

  /**
   * Error message prefix
   * @default 'XML stringification failed'
   */
  errorPrefix?: string;
}

/**
 * Safely converts data to an XML string
 * @param data The data to convert to XML
 * @param options Stringify options
 * @throws {ValidationError} if stringification fails
 * @returns The XML string
 */
export function stringifyXml(
  data: unknown,
  options: StringifyXmlOptions = {},
): string {
  const {
    format = false,
    indent = 2,
    declaration,
    builder,
    errorPrefix = 'XML stringification failed',
  } = options;

  try {
    if (data === undefined || data === null) {
      throw new TypeError('Invalid data provided');
    }

    const xmlBuilder = new XMLBuilder({
      ...builder,
      format,
      indentBy: ' '.repeat(indent),
    });
    const xml = String(xmlBuilder.build(data)).trim();

    if (!declaration) {
      return xml;
    }

    const xmlDeclaration = stringifyXmlDeclaration(declaration);
    return [xmlDeclaration, xml].join(format ? '\n' : '');
  } catch (error) {
    throw new ValidationError('Failed to stringify XML', errorPrefix, error);
  }
}

/**
 * Stringifies the XML declaration
 * @param declaration The XML declaration
 * @returns The XML declaration string
 */
export function stringifyXmlDeclaration(declaration: XmlDeclaration): string {
  return `<?xml${declaration.version ? ` version="${declaration.version}"` : ''}${declaration.encoding ? ` encoding="${declaration.encoding}"` : ''}?>`;
}
