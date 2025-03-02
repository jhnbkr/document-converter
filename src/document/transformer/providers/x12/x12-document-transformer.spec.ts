import { Test, TestingModule } from '@nestjs/testing';

import { DOCUMENT_CONTENT_TYPE } from '@document/types';

import { DocumentTransformerError } from '../../errors';
import { X12DocumentTransformer } from './x12-document-transformer';

describe('X12DocumentTransformer', () => {
  let transformer: X12DocumentTransformer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [X12DocumentTransformer],
    }).compile();
    transformer = module.get<X12DocumentTransformer>(X12DocumentTransformer);
  });

  it('should expose APPLICATION_EDI_X12 as content type', () => {
    expect(transformer.contentType).toBe(
      DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12,
    );
  });

  describe('parse()', () => {
    it('should parse X12 string to document', () => {
      const content = [
        'ProductID*4*8*15*16*23~',
        'ProductID*a*b*c*d*e~',
        'AddressID*42*108*3*14~',
        'ContactID*59*26~',
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
      const content = ['ProductID*4*8~~', 'ContactID*59*26~'].join('\n');

      expect(transformer.parse(content)).toEqual({
        segments: [
          { name: 'ProductID', elements: [{ value: '4' }, { value: '8' }] },
          { name: 'ContactID', elements: [{ value: '59' }, { value: '26' }] },
        ],
      });
    });

    it('should handle empty elements', () => {
      const content = ['ProductID*4*8***~', 'ContactID**59*26~'].join('\n');

      expect(transformer.parse(content)).toEqual({
        segments: [
          {
            name: 'ProductID',
            elements: [
              { value: '4' },
              { value: '8' },
              { value: '' },
              { value: '' },
              { value: '' },
            ],
          },
          {
            name: 'ContactID',
            elements: [{ value: '' }, { value: '59' }, { value: '26' }],
          },
        ],
      });
    });

    it('should throw for empty content', () => {
      expect(() => transformer.parse('')).toThrow(DocumentTransformerError);
    });

    it('should throw for invalid content', () => {
      expect(() => transformer.parse({} as never)).toThrow(
        DocumentTransformerError,
      );
    });

    it('should throw for invalid separators', () => {
      expect(() =>
        transformer.parse('ProductID*4*8~', {
          segmentSeparator: '*',
          elementSeparator: '*',
        }),
      ).toThrow(DocumentTransformerError);
    });
  });

  describe('serialize()', () => {
    it('should serialize document to X12 string', () => {
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

      expect(transformer.serialize(document)).toBe(
        'ProductID*4*8*15*16*23~ProductID*a*b*c*d*e~AddressID*42*108*3*14~ContactID*59*26~',
      );
    });

    it('should format output when specified', () => {
      const document = {
        segments: [
          { name: 'Test', elements: [{ value: '1' }, { value: '2' }] },
        ],
      };

      expect(transformer.serialize(document, { format: true })).toBe(
        'Test*1*2~',
      );
    });

    it('should handle empty document', () => {
      expect(transformer.serialize({ segments: [] })).toBe('');
    });

    it('should handle empty segments', () => {
      const document = {
        segments: [{ name: 'Test', elements: [] }],
      };

      expect(transformer.serialize(document)).toBe('Test~');
    });

    it('should throw for invalid document', () => {
      expect(() => transformer.serialize({ foo: 'bar' } as never)).toThrow(
        DocumentTransformerError,
      );

      expect(() => transformer.serialize(null as never)).toThrow(
        DocumentTransformerError,
      );
    });
  });
});
