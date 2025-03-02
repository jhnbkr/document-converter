/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

import { DocumentService } from './document.service';
import { DocumentError } from './errors';
import { DocumentTransformer } from './transformer/interfaces';
import {
  JsonDocumentTransformer,
  X12DocumentTransformer,
  XmlDocumentTransformer,
} from './transformer/providers';
import { DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS } from './transformer/types';
import { DOCUMENT_CONTENT_TYPE } from './types';

describe('DocumentService', () => {
  let service: DocumentService;
  let jsonTransformer: jest.Mocked<DocumentTransformer>;
  let x12Transformer: jest.Mocked<DocumentTransformer>;
  let xmlTransformer: jest.Mocked<DocumentTransformer>;

  beforeEach(async () => {
    jsonTransformer = {
      contentType: DOCUMENT_CONTENT_TYPE.APPLICATION_JSON,
      parse: jest.fn().mockReturnValue({ parsed: 'json-document' }),
      serialize: jest.fn().mockReturnValue('{"serialized":"json"}'),
    };

    x12Transformer = {
      contentType: DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12,
      parse: jest.fn().mockReturnValue({ parsed: 'x12-document' }),
      serialize: jest.fn().mockReturnValue('X12*serialized~'),
    };

    xmlTransformer = {
      contentType: DOCUMENT_CONTENT_TYPE.APPLICATION_XML,
      parse: jest.fn().mockReturnValue({ parsed: 'xml-document' }),
      serialize: jest.fn().mockReturnValue('<xml>serialized</xml>'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: JsonDocumentTransformer, useValue: jsonTransformer },
        { provide: X12DocumentTransformer, useValue: x12Transformer },
        { provide: XmlDocumentTransformer, useValue: xmlTransformer },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  describe('getTransformer', () => {
    Object.values(DOCUMENT_CONTENT_TYPE).forEach((contentType) => {
      it(`should return a valid transformer for ${contentType}`, () => {
        const transformer = service.getTransformer(contentType);
        expect(transformer).toBeDefined();
        expect(transformer).toHaveProperty('contentType', contentType);
        expect(transformer).toHaveProperty('parse');
        expect(transformer).toHaveProperty('serialize');
      });
    });

    it('should throw DocumentError for unsupported content type', () => {
      expect(() => service.getTransformer('unsupported/type' as never)).toThrow(
        DocumentError,
      );
    });
  });

  describe('convert', () => {
    it('should correctly convert between valid content types', () => {
      const content = { key: 'value' };
      const fromContentType = DOCUMENT_CONTENT_TYPE.APPLICATION_JSON;
      const toContentType = DOCUMENT_CONTENT_TYPE.APPLICATION_XML;

      const result = service.convert(
        content,
        fromContentType,
        toContentType,
        DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS,
      );

      expect(jsonTransformer.parse).toHaveBeenCalledWith(
        content,
        DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS,
      );
      expect(xmlTransformer.serialize).toHaveBeenCalledWith(
        { parsed: 'json-document' },
        DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS,
      );

      expect(result).toBe('<xml>serialized</xml>');
    });

    it('should throw DocumentError for unsupported content types', () => {
      const content = { key: 'value' };
      const fromContentType = 'unsupported/type';
      const toContentType = DOCUMENT_CONTENT_TYPE.APPLICATION_XML;

      expect(() =>
        service.convert(
          content,
          fromContentType as never,
          toContentType,
          DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS,
        ),
      ).toThrow(DocumentError);
    });

    it('should throw DocumentTransformerError for invalid input data', () => {
      const content = null;
      const fromContentType = DOCUMENT_CONTENT_TYPE.APPLICATION_JSON;
      const toContentType = DOCUMENT_CONTENT_TYPE.APPLICATION_XML;

      jsonTransformer.parse.mockImplementation(() => {
        throw new DocumentError('Cannot parse null content');
      });

      expect(() =>
        service.convert(
          content,
          fromContentType,
          toContentType,
          DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS,
        ),
      ).toThrow(DocumentError);
    });
  });
});
