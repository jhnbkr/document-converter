import { ValidationError } from '../errors';
import { parseJson } from './parse-json';

describe('parseJson', () => {
  it('should parse JSON object', () => {
    const json = '{"name":"John","age":30}';
    expect(parseJson(json)).toEqual({ name: 'John', age: 30 });
  });

  it('should parse JSON array', () => {
    const json = '[1,2,3]';
    expect(parseJson(json)).toEqual([1, 2, 3]);
  });

  it('should parse primitive values', () => {
    expect(parseJson('"string"')).toBe('string');
    expect(parseJson('123')).toBe(123);
    expect(parseJson('true')).toBe(true);
    expect(parseJson('null')).toBe(null);
  });
  it('should throw for invalid JSON', () => {
    const json = 'invalid';
    expect(() => parseJson(json)).toThrow(ValidationError);
    expect(() => parseJson(json)).toThrow(
      'JSON parsing failed: Invalid JSON syntax',
    );
  });

  it('should throw for incomplete JSON', () => {
    const json = '{"name": "John"';
    expect(() => parseJson(json)).toThrow(ValidationError);
    expect(() => parseJson(json)).toThrow(
      'JSON parsing failed: Invalid JSON syntax',
    );
  });

  it('should throw with custom prefix', () => {
    const json = 'invalid';
    const errorPrefix = 'Document parsing';

    expect(() => parseJson(json, { errorPrefix })).toThrow(ValidationError);
    expect(() => parseJson(json, { errorPrefix })).toThrow(
      `${errorPrefix}: Invalid JSON syntax`,
    );
  });
});
