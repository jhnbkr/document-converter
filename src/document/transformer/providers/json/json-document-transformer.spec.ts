import { Test, TestingModule } from '@nestjs/testing';

import { DOCUMENT_CONTENT_TYPE } from '@document/types';

import { DocumentTransformerError } from '../../errors';
import { JsonDocumentTransformer } from './json-document-transformer';

describe('JsonDocumentTransformer', () => {
  let transformer: JsonDocumentTransformer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonDocumentTransformer],
    }).compile();
    transformer = module.get<JsonDocumentTransformer>(JsonDocumentTransformer);
  });

  it('should expose APPLICATION_JSON as content type', () => {
    expect(transformer.contentType).toBe(
      DOCUMENT_CONTENT_TYPE.APPLICATION_JSON,
    );
  });

  describe('parse()', () => {
    it('should parse JSON string to document', () => {
      const content = JSON.stringify({
        ProductID: [
          {
            ProductID1: '4',
            ProductID2: '8',
            ProductID3: '15',
            ProductID4: '16',
            ProductID5: '23',
          },
          {
            ProductID1: 'a',
            ProductID2: 'b',
            ProductID3: 'c',
            ProductID4: 'd',
            ProductID5: 'e',
          },
        ],
        AddressID: [
          {
            AddressID1: '42',
            AddressID2: '108',
            AddressID3: '3',
            AddressID4: '14',
          },
        ],
        ContactID: [
          {
            ContactID1: '59',
            ContactID2: '26',
          },
        ],
      });

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

    it('should parse JSON object to document', () => {
      const content = {
        ProductID: [
          {
            ProductID1: '4',
            ProductID2: '8',
            ProductID3: '15',
            ProductID4: '16',
            ProductID5: '23',
          },
        ],
      };

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
        ],
      });
    });

    it('should handle empty segments', () => {
      const content = JSON.stringify({
        ProductID: [{}, {}],
        ContactID: [
          {
            ContactID1: '59',
            ContactID2: '26',
          },
        ],
      });

      expect(transformer.parse(content)).toEqual({
        segments: [
          { name: 'ProductID', elements: [] },
          { name: 'ProductID', elements: [] },
          { name: 'ContactID', elements: [{ value: '59' }, { value: '26' }] },
        ],
      });
    });

    it('should handle empty elements', () => {
      const content = JSON.stringify({
        ProductID: [
          {
            ProductID1: '',
            ProductID2: '8',
            ProductID3: '',
          },
        ],
      });

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
      expect(() => transformer.parse(null as never)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw error for invalid element names', () => {
      const content = JSON.stringify({
        ProductID: [
          {
            ProductID1: '1',
            InvalidName2: '1', // Should be ProductID2
          },
        ],
      });

      expect(() => transformer.parse(content)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw error for non-sequential element names', () => {
      const content = JSON.stringify({
        ProductID: [
          {
            ProductID2: '1', // Should start with ProductID1
            ProductID1: '1',
          },
        ],
      });

      expect(() => transformer.parse(content)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw error for excessive nesting depth', () => {
      const content = JSON.stringify({
        ProductID: [
          {
            ProductID1: {
              TooDeep: '1', // Exceeds max depth
            },
          },
        ],
      });

      expect(() => transformer.parse(content)).toThrow(
        DocumentTransformerError,
      );
    });
  });

  describe('serialize()', () => {
    it('should serialize document to JSON', () => {
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

      const expected = JSON.stringify({
        ProductID: [
          {
            ProductID1: '4',
            ProductID2: '8',
            ProductID3: '15',
            ProductID4: '16',
            ProductID5: '23',
          },
          {
            ProductID1: 'a',
            ProductID2: 'b',
            ProductID3: 'c',
            ProductID4: 'd',
            ProductID5: 'e',
          },
        ],
        AddressID: [
          {
            AddressID1: '42',
            AddressID2: '108',
            AddressID3: '3',
            AddressID4: '14',
          },
        ],
        ContactID: [
          {
            ContactID1: '59',
            ContactID2: '26',
          },
        ],
      });

      expect(transformer.serialize(document)).toBe(expected);
    });

    it('should format output when specified', () => {
      const document = {
        segments: [
          { name: 'Test', elements: [{ value: '1' }, { value: '2' }] },
        ],
      };

      const expected = JSON.stringify(
        {
          Test: [
            {
              Test1: '1',
              Test2: '2',
            },
          ],
        },
        null,
        2,
      );

      expect(transformer.serialize(document, { format: true })).toBe(expected);
    });

    it('should handle empty document', () => {
      expect(transformer.serialize({ segments: [] })).toBe('{}');
    });

    it('should handle empty segments', () => {
      const document = {
        segments: [{ name: 'Test', elements: [] }],
      };

      expect(transformer.serialize(document)).toBe(
        JSON.stringify({ Test: [{}] }),
      );
    });

    it('should handle empty elements', () => {
      const document = {
        segments: [{ name: 'Test', elements: [{ value: '' }] }],
      };

      expect(transformer.serialize(document)).toBe(
        JSON.stringify({ Test: [{ Test1: '' }] }),
      );
    });

    it('should throw error for invalid document', () => {
      expect(() => transformer.serialize(null as never)).toThrow(
        DocumentTransformerError,
      );
    });
  });
});
