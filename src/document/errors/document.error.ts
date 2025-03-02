import { BaseError } from '@common/errors';

export class DocumentError extends BaseError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
