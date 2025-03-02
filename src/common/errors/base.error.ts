export abstract class BaseError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
  }
}
