import { ValidationError } from '../errors';

export interface ParseJsonOptions {
  /**
   * Error message prefix
   * @default 'JSON parsing failed'
   */
  errorPrefix?: string;
}

/**
 * Safely parses a JSON string
 * @param json The JSON string to parse
 * @param options Parse options
 * @throws {ValidationError} if parsing fails
 * @returns The parsed JSON value
 */
export function parseJson(
  json: string,
  options: ParseJsonOptions = {},
): unknown {
  const { errorPrefix = 'JSON parsing failed' } = options;

  try {
    return JSON.parse(json);
  } catch (error) {
    throw new ValidationError('Invalid JSON syntax', errorPrefix, error);
  }
}
