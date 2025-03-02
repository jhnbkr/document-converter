import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  public readonly errors: string[];

  constructor(errors: string | string[], prefix?: string, cause?: unknown) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    const message = prefix
      ? `${prefix}: ${errorArray.join(', ')}`
      : errorArray.join(', ');

    super(message, cause);
    this.errors = errorArray;
    this.name = 'ValidationError';
  }
}
