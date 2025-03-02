import { ValidationError } from '../errors';
import { stringifyXml, stringifyXmlDeclaration } from './stringify-xml';

describe('stringifyXml', () => {
  it('should stringify simple object', () => {
    const data = { root: { item: 'test' } };
    expect(stringifyXml(data)).toBe('<root><item>test</item></root>');
  });

  it('should stringify with formatting', () => {
    const data = { root: { item: 'test' } };
    expect(stringifyXml(data, { format: true })).toBe(
      '<root>\n  <item>test</item>\n</root>',
    );
  });

  it('should respect custom indent', () => {
    const data = { root: { item: 'test' } };
    expect(stringifyXml(data, { format: true, indent: 5 })).toBe(
      '<root>\n     <item>test</item>\n</root>',
    );
  });

  it('should include declaration when specified', () => {
    const data = { root: { item: 'test' } };
    expect(
      stringifyXml(data, {
        declaration: { version: '1.0', encoding: 'UTF-8' },
      }),
    ).toBe(
      '<?xml version="1.0" encoding="UTF-8"?><root><item>test</item></root>',
    );
  });

  it('should throw for invalid data', () => {
    const data = undefined;
    expect(() => stringifyXml(data)).toThrow(ValidationError);
    expect(() => stringifyXml(data)).toThrow(
      'XML stringification failed: Failed to stringify XML',
    );
  });

  it('should throw with custom prefix', () => {
    const data = undefined;
    const errorPrefix = 'Custom error';
    expect(() => stringifyXml(data, { errorPrefix })).toThrow(ValidationError);
    expect(() => stringifyXml(data, { errorPrefix })).toThrow(
      'Custom error: Failed to stringify XML',
    );
  });
});

describe('stringifyXmlDeclaration', () => {
  it('should stringify declaration with version', () => {
    const declaration = { version: '1.0' };
    expect(stringifyXmlDeclaration(declaration)).toBe('<?xml version="1.0"?>');
  });

  it('should stringify declaration with encoding', () => {
    const declaration = { encoding: 'UTF-8' };
    expect(stringifyXmlDeclaration(declaration)).toBe(
      '<?xml encoding="UTF-8"?>',
    );
  });

  it('should stringify declaration with version and encoding', () => {
    const declaration = { version: '1.0', encoding: 'UTF-8' };
    expect(stringifyXmlDeclaration(declaration)).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>',
    );
  });

  it('should stringify declaration neither version nor encoding', () => {
    const declaration = {};
    expect(stringifyXmlDeclaration(declaration)).toBe('<?xml?>');
  });
});
