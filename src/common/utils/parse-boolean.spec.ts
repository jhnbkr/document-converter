import { parseBoolean } from './parse-boolean';

describe('parseBoolean', () => {
  it('should handle boolean values', () => {
    expect(parseBoolean(true)).toBe(true);
    expect(parseBoolean(false)).toBe(false);
  });

  it('should handle number values', () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean(2)).toBe(false);
  });

  it('should parse truthy strings', () => {
    ['true', 'TRUE', ' True ', '1', 'yes', 'YES', 'on', 'ON'].forEach(
      (value) => {
        expect(parseBoolean(value)).toBe(true);
      },
    );
  });

  it('should return false for non-truthy strings', () => {
    ['false', 'FALSE', '0', 'no', 'off', '', 'maybe', '2'].forEach((value) => {
      expect(parseBoolean(value)).toBe(false);
    });
  });

  it('should return false for invalid types', () => {
    [null, undefined, {}, [], Symbol('test')].forEach((value) => {
      expect(parseBoolean(value)).toBe(false);
    });
  });
});
