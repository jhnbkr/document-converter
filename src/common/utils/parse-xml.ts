import { X2jOptions, XMLParser, XMLValidator } from 'fast-xml-parser';

import { ValidationError } from '../errors';

export interface ParseXmlOptions {
  /**
   * XML Parser options
   * @see X2jOptions
   */
  parser?: X2jOptions;

  /**
   * Error message prefix
   * @default 'XML parsing failed'
   */
  errorPrefix?: string;
}

/**
 * Safely parses an XML string
 * @param xml The XML string to parse
 * @param options Parse options
 * @throws {ValidationError} if parsing fails
 * @returns The parsed XML value
 */
export function parseXml(xml: string, options: ParseXmlOptions = {}): unknown {
  const { errorPrefix = 'XML parsing failed' } = options;

  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    throw new ValidationError(validation.err.msg, errorPrefix);
  }

  const parser = new XMLParser(options.parser);

  try {
    return parser.parse(xml);
  } catch (error) {
    throw new ValidationError('Failed to parse XML', errorPrefix, error);
  }
}
