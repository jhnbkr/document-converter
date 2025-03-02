import { IsEmail, IsNotEmpty, IsNumber, Min } from 'class-validator';

import { ValidationError } from '../errors';
import { parseDto } from './parse-dto';

describe('parseDto', () => {
  class TestDto {
    @IsNotEmpty({ message: 'Name is required' })
    name!: string;

    @IsNumber({}, { message: 'Age must be a number' })
    @Min(0, { message: 'Age must be positive' })
    age!: number;

    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;
  }

  it('should parse valid data', () => {
    const data = {
      name: 'John',
      age: 25,
      email: 'john@example.com',
    };
    const result = parseDto(data, TestDto);
    expect(result).toBeInstanceOf(TestDto);
    expect(result).toEqual(expect.objectContaining(data));
  });

  it('should throw for missing fields', () => {
    const data = {
      name: 'John',
      age: 25,
      // missing email
    };
    expect(() => parseDto(data, TestDto)).toThrow(ValidationError);
    expect(() => parseDto(data, TestDto)).toThrow(/Invalid email format/);
  });

  it('should throw for invalid field types', () => {
    const data = {
      name: 'John',
      age: '25', // should be number
      email: 'john@example.com',
    };
    expect(() => parseDto(data, TestDto)).toThrow(ValidationError);
    expect(() => parseDto(data, TestDto)).toThrow(/Age must be a number/);
  });

  it('should throw for multiple validation errors', () => {
    const data = {
      name: '',
      age: -1,
      email: 'not-an-email',
    };
    expect(() => parseDto(data, TestDto)).toThrow(ValidationError);
    // Check that all error messages are included
    const testFn = () => parseDto(data, TestDto);
    expect(testFn).toThrow(/Name is required/);
    expect(testFn).toThrow(/Age must be positive/);
    expect(testFn).toThrow(/Invalid email format/);
  });

  it('should throw with custom prefix', () => {
    const data = { name: '' };
    const errorPrefix = 'User validation';

    expect(() => parseDto(data, TestDto, { errorPrefix })).toThrow(
      ValidationError,
    );
    expect(() => parseDto(data, TestDto, { errorPrefix })).toThrow(
      `${errorPrefix}: Name is required`,
    );
  });

  it('should throw for non-object input', () => {
    expect(() => parseDto('not an object', TestDto)).toThrow(ValidationError);
    expect(() => parseDto('not an object', TestDto)).toThrow(
      /Input must be an object/,
    );
  });
});
