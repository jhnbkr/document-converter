import { Test, TestingModule } from '@nestjs/testing';

import { stringifyXmlDeclaration } from '@common/utils';
import { DOCUMENT_CONTENT_TYPE } from '@document/types';

import { DocumentTransformerError } from '../../errors';
import { XmlDocumentTransformer } from './xml-document-transformer';
import {
  DEFAULT_XML_ENCODING,
  DEFAULT_XML_VERSION,
} from './xml-document-transformer.constants';

describe('XmlDocumentTransformer', () => {
  let transformer: XmlDocumentTransformer;
  const xmlDeclaration = stringifyXmlDeclaration({
    version: DEFAULT_XML_VERSION,
    encoding: DEFAULT_XML_ENCODING,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmlDocumentTransformer],
    }).compile();
    transformer = module.get<XmlDocumentTransformer>(XmlDocumentTransformer);
  });

  it('should expose APPLICATION_XML as content type', () => {
    expect(transformer.contentType).toBe(DOCUMENT_CONTENT_TYPE.APPLICATION_XML);
  });

  describe('parse()', () => {
    it('should parse XML string to document', () => {
      const content = [
        '<root>',
        '  <ProductID>',
        '    <ProductID1>4</ProductID1>',
        '    <ProductID2>8</ProductID2>',
        '    <ProductID3>15</ProductID3>',
        '    <ProductID4>16</ProductID4>',
        '    <ProductID5>23</ProductID5>',
        '  </ProductID>',
        '  <ProductID>',
        '    <ProductID1>a</ProductID1>',
        '    <ProductID2>b</ProductID2>',
        '    <ProductID3>c</ProductID3>',
        '    <ProductID4>d</ProductID4>',
        '    <ProductID5>e</ProductID5>',
        '  </ProductID>',
        '  <AddressID>',
        '    <AddressID1>42</AddressID1>',
        '    <AddressID2>108</AddressID2>',
        '    <AddressID3>3</AddressID3>',
        '    <AddressID4>14</AddressID4>',
        '  </AddressID>',
        '  <ContactID>',
        '    <ContactID1>59</ContactID1>',
        '    <ContactID2>26</ContactID2>',
        '  </ContactID>',
        '</root>',
      ].join('\n');

      expect(transformer.parse(content)).toEqual({
        segments: [
          {
            name: 'ProductID',
            elements: [
              { value: '4' },
              { value: '8' },
              { value: '15' },
              { value: '16' },
              { value: '23' },
            ],
          },
          {
            name: 'ProductID',
            elements: [
              { value: 'a' },
              { value: 'b' },
              { value: 'c' },
              { value: 'd' },
              { value: 'e' },
            ],
          },
          {
            name: 'AddressID',
            elements: [
              { value: '42' },
              { value: '108' },
              { value: '3' },
              { value: '14' },
            ],
          },
          {
            name: 'ContactID',
            elements: [{ value: '59' }, { value: '26' }],
          },
        ],
      });
    });

    it('should handle empty segments', () => {
      const content = [
        '<root>',
        '  <ProductID></ProductID>',
        '  <ProductID/>',
        '  <ContactID>',
        '    <ContactID1>59</ContactID1>',
        '    <ContactID2>26</ContactID2>',
        '  </ContactID>',
        '</root>',
      ].join('\n');

      expect(transformer.parse(content)).toEqual({
        segments: [
          { name: 'ProductID', elements: [] },
          { name: 'ProductID', elements: [] },
          { name: 'ContactID', elements: [{ value: '59' }, { value: '26' }] },
        ],
      });
    });

    it('should handle empty elements', () => {
      const content = [
        '<root>',
        '  <ProductID>',
        '    <ProductID1></ProductID1>',
        '    <ProductID2>8</ProductID2>',
        '    <ProductID3/>',
        '  </ProductID>',
        '</root>',
      ].join('\n');

      expect(transformer.parse(content)).toEqual({
        segments: [
          {
            name: 'ProductID',
            elements: [{ value: '' }, { value: '8' }, { value: '' }],
          },
        ],
      });
    });

    it('should throw error for empty content', () => {
      expect(() => transformer.parse('')).toThrow(DocumentTransformerError);
    });

    it('should throw error for invalid content', () => {
      expect(() => transformer.parse({} as never)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw error for invalid element names', () => {
      const content = [
        '<root>',
        '  <ProductID>',
        '    <ProductID1>1</ProductID1>',
        '    <InvalidName2>1</InvalidName2>', // Should be ProductID2
        '  </ProductID>',
        '</root>',
      ].join('\n');

      expect(() => transformer.parse(content)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw error for non-sequential element names', () => {
      const content = [
        '<root>',
        '  <ProductID>',
        '    <ProductID2>1</ProductID2>', // Should start with ProductID1
        '    <ProductID1>1</ProductID1>',
        '  </ProductID>',
        '</root>',
      ].join('\n');

      expect(() => transformer.parse(content)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw error for excessive nesting depth', () => {
      const content = [
        '<root>',
        '  <ProductID>',
        '    <ProductID1>',
        '      <TooDeep>1</TooDeep>', // Exceeds max depth
        '    </ProductID1>',
        '  </ProductID>',
        '</root>',
      ].join('\n');

      expect(() => transformer.parse(content)).toThrow(
        DocumentTransformerError,
      );
    });
  });

  describe('serialize()', () => {
    it('should serialize document to XML string', () => {
      const document = {
        segments: [
          {
            name: 'ProductID',
            elements: [
              { value: '4' },
              { value: '8' },
              { value: '15' },
              { value: '16' },
              { value: '23' },
            ],
          },
          {
            name: 'ProductID',
            elements: [
              { value: 'a' },
              { value: 'b' },
              { value: 'c' },
              { value: 'd' },
              { value: 'e' },
            ],
          },
          {
            name: 'AddressID',
            elements: [
              { value: '42' },
              { value: '108' },
              { value: '3' },
              { value: '14' },
            ],
          },
          {
            name: 'ContactID',
            elements: [{ value: '59' }, { value: '26' }],
          },
        ],
      };

      const expected = [
        xmlDeclaration,
        '<root>',
        '<ProductID>',
        '<ProductID1>4</ProductID1>',
        '<ProductID2>8</ProductID2>',
        '<ProductID3>15</ProductID3>',
        '<ProductID4>16</ProductID4>',
        '<ProductID5>23</ProductID5>',
        '</ProductID>',
        '<ProductID>',
        '<ProductID1>a</ProductID1>',
        '<ProductID2>b</ProductID2>',
        '<ProductID3>c</ProductID3>',
        '<ProductID4>d</ProductID4>',
        '<ProductID5>e</ProductID5>',
        '</ProductID>',
        '<AddressID>',
        '<AddressID1>42</AddressID1>',
        '<AddressID2>108</AddressID2>',
        '<AddressID3>3</AddressID3>',
        '<AddressID4>14</AddressID4>',
        '</AddressID>',
        '<ContactID>',
        '<ContactID1>59</ContactID1>',
        '<ContactID2>26</ContactID2>',
        '</ContactID>',
        '</root>',
      ].join('');

      expect(transformer.serialize(document)).toBe(expected);
    });

    it('should format output when specified', () => {
      const document = {
        segments: [
          { name: 'Test', elements: [{ value: '1' }, { value: '2' }] },
        ],
      };

      const expected = [
        xmlDeclaration,
        '<root>',
        '  <Test>',
        '    <Test1>1</Test1>',
        '    <Test2>2</Test2>',
        '  </Test>',
        '</root>',
      ].join('\n');

      expect(transformer.serialize(document, { format: true })).toBe(expected);
    });

    it('should handle empty document', () => {
      expect(transformer.serialize({ segments: [] })).toBe(
        `${xmlDeclaration}<root></root>`,
      );
    });

    it('should handle empty segments', () => {
      const document = {
        segments: [{ name: 'Test', elements: [] }],
      };

      expect(transformer.serialize(document)).toBe(
        `${xmlDeclaration}<root><Test></Test></root>`,
      );
    });

    it('should handle empty elements', () => {
      const document = {
        segments: [{ name: 'Test', elements: [{ value: '' }] }],
      };

      expect(transformer.serialize(document)).toBe(
        `${xmlDeclaration}<root><Test><Test1></Test1></Test></root>`,
      );
    });

    it('should throw error for invalid document', () => {
      expect(() => transformer.serialize(null as never)).toThrow(
        DocumentTransformerError,
      );
    });
  });
});
