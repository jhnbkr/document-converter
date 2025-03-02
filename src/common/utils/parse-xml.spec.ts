import { ValidationError } from '../errors';

import { parseXml } from './parse-xml';

describe('parseXml', () => {
  it('should parse simple XML', () => {
    const xml = '<root><item>test</item></root>';
    const result = parseXml(xml);
    expect(result).toEqual({
      root: {
        item: 'test',
      },
    });
  });

  it('should parse with parser options', () => {
    const xml = '<root><item>123</item></root>';
    const result = parseXml(xml, {
      parser: {
        parseTagValue: true,
      },
    });
    expect(result).toEqual({
      root: {
        item: 123,
      },
    });
  });
  it('should throw for invalid XML', () => {
    const xml = '<invalid';
    expect(() => parseXml(xml)).toThrow(ValidationError);
    expect(() => parseXml(xml)).toThrow('XML parsing failed: Unclosed tag');
  });

  it('should throw with custom prefix', () => {
    const xml = '<invalid';
    const errorPrefix = 'Document parsing';

    expect(() => parseXml(xml, { errorPrefix })).toThrow(ValidationError);
    expect(() => parseXml(xml, { errorPrefix })).toThrow(
      `${errorPrefix}: Unclosed tag`,
    );
  });
});
