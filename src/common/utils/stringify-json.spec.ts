import { ValidationError } from '../errors';

import { stringifyJson } from './stringify-json';

describe('stringifyJson', () => {
  it('should stringify simple object', () => {
    const data = { name: 'test' };
    expect(stringifyJson(data)).toBe('{"name":"test"}');
  });

  it('should stringify with formatting', () => {
    const data = { name: 'test' };
    expect(stringifyJson(data, { format: true })).toBe(
      '{\n  "name": "test"\n}',
    );
  });

  it('should respect custom indent', () => {
    const data = { name: 'test' };
    expect(stringifyJson(data, { format: true, indent: 5 })).toBe(
      '{\n     "name": "test"\n}',
    );
  });
  it('should throw for circular references', () => {
    interface Circular {
      self?: Circular;
    }
    const circular: Circular = {};
    circular.self = circular;

    expect(() => stringifyJson(circular)).toThrow(ValidationError);
    expect(() => stringifyJson(circular)).toThrow(
      'JSON stringification failed: Failed to stringify JSON',
    );
  });

  it('should throw with custom prefix', () => {
    interface Circular {
      self?: Circular;
    }
    const circular: Circular = {};
    circular.self = circular;

    const errorPrefix = 'Custom error';
    expect(() => stringifyJson(circular, { errorPrefix })).toThrow(
      ValidationError,
    );
    expect(() => stringifyJson(circular, { errorPrefix })).toThrow(
      'Custom error: Failed to stringify JSON',
    );
  });

  it('should throw ValidationError for BigInt values', () => {
    const data = { value: BigInt(123) };
    expect(() => stringifyJson(data)).toThrow(ValidationError);
  });

  it('should include default prefix in error message', () => {
    const data = { value: BigInt(123) };
    expect(() => stringifyJson(data)).toThrow(
      'JSON stringification failed: Failed to stringify JSON',
    );
  });
});
