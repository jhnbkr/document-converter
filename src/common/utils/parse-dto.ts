import { ClassConstructor, plainToInstance } from 'class-transformer';
import {
  ValidationError as ClassValidationError,
  validateSync,
} from 'class-validator';

import { ValidationError } from '../errors';

export interface ParseDtoOptions {
  /**
   * Error message prefix
   * @default 'Validation failed'
   */
  errorPrefix?: string;
}

/**
 * Parses and validates a DTO object
 * @param data The data to parse and validate
 * @param dtoClass The DTO class to validate against
 * @param options Parse options
 * @throws {ValidationError} if validation fails
 * @returns The validated DTO instance
 */
export function parseDto<T>(
  data: unknown,
  dtoClass: ClassConstructor<T>,
  options: ParseDtoOptions = {},
): T {
  const { errorPrefix = 'Validation failed' } = options;

  const dtoInstance = plainToInstance(dtoClass, data);
  if (dtoInstance === null || typeof dtoInstance !== 'object') {
    throw new ValidationError('Input must be an object', errorPrefix);
  }

  const validationErrors = validateSync(dtoInstance);

  if (validationErrors.length > 0) {
    const errorMessages = extractErrorMessages(validationErrors);
    throw new ValidationError(errorMessages, errorPrefix);
  }

  return dtoInstance;
}

function extractErrorMessages(errors: ClassValidationError[]): string[] {
  return errors.reduce((messages: string[], error) => {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children?.length) {
      messages.push(...extractErrorMessages(error.children));
    }

    return messages;
  }, []);
}
