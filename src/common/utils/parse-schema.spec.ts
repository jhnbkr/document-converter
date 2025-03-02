import { z } from 'zod';

import { ValidationError } from '../errors';
import { parseSchema } from './parse-schema';

describe('parseSchema', () => {
  const TestSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(0, 'Age must be positive'),
    email: z.string().email('Invalid email format'),
  });

  it('should parse valid data', () => {
    const data = {
      name: 'John',
      age: 25,
      email: 'john@example.com',
    };
    const result = parseSchema(TestSchema, data);
    expect(result).toEqual(data);
  });
  it('should throw for missing fields', () => {
    const data = {
      name: 'John',
      age: 25,
      // missing email
    };
    expect(() => parseSchema(TestSchema, data)).toThrow(ValidationError);
    expect(() => parseSchema(TestSchema, data)).toThrow(
      'Validation failed: Required',
    );
  });

  it('should throw for invalid field types', () => {
    const data = {
      name: 'John',
      age: '25', // should be number
      email: 'john@example.com',
    };
    expect(() => parseSchema(TestSchema, data)).toThrow(ValidationError);
    expect(() => parseSchema(TestSchema, data)).toThrow(
      'Validation failed: Expected number, received string',
    );
  });

  it('should throw for multiple validation errors', () => {
    const data = {
      name: '',
      age: -1,
      email: 'not-an-email',
    };
    expect(() => parseSchema(TestSchema, data)).toThrow(ValidationError);
    expect(() => parseSchema(TestSchema, data)).toThrow(
      'Validation failed: Name is required, Age must be positive, Invalid email format',
    );
  });

  it('should throw with custom prefix', () => {
    const data = { name: '' };
    const errorPrefix = 'User validation';

    expect(() => parseSchema(TestSchema, data, { errorPrefix })).toThrow(
      ValidationError,
    );
    expect(() => parseSchema(TestSchema, data, { errorPrefix })).toThrow(
      `${errorPrefix}: Name is required`,
    );
  });
});
