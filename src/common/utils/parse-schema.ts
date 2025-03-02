import { ZodSchema } from 'zod';
import { ValidationError } from '../errors';

export interface ParseSchemaOptions {
  /**
   * Error message prefix
   * @default 'Validation failed'
   */
  errorPrefix?: string;
}

/**
 * Parses and validates data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @param options Parse options
 * @throws {ValidationError} if validation fails
 * @returns The parsed and validated data
 */
export function parseSchema<T>(
  schema: ZodSchema<T>,
  data: unknown,
  options: ParseSchemaOptions = {},
): T {
  const { errorPrefix = 'Validation failed' } = options;

  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);
    throw new ValidationError(errors, errorPrefix);
  }

  return result.data;
}
