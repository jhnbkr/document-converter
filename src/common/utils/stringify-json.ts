import { ValidationError } from '../errors';

export interface StringifyJsonOptions {
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
   * Error message prefix
   * @default 'JSON stringification failed'
   */
  errorPrefix?: string;
}

/**
 * Safely converts data to a JSON string
 * @param data The data to convert to JSON
 * @param options Stringify options
 * @throws {ValidationError} if stringification fails
 * @returns The JSON string
 */
export function stringifyJson(
  data: unknown,
  options: StringifyJsonOptions = {},
): string {
  const {
    format = false,
    indent = 2,
    errorPrefix = 'JSON stringification failed',
  } = options;

  try {
    return JSON.stringify(data, null, format ? indent : undefined);
  } catch (error) {
    throw new ValidationError('Failed to stringify JSON', errorPrefix, error);
  }
}
