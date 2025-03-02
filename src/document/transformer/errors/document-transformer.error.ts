import { DocumentError } from '@document/errors';

export class DocumentTransformerError extends DocumentError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}
