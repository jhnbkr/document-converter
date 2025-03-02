import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { DocumentModule } from '@document/document.module';
import { DOCUMENT_CONTENT_TYPE } from '@document/types';

import { configureApp } from '../src/app.setup';
import { DOCUMENT_FIXTURES } from './fixtures';

const stripCharset = (contentType: string) => contentType.split(';')[0];

const normalizeDocument = (content: string) =>
  content.trim().replace(/\r\n/g, '\n');

describe('Document (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DocumentModule],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /v1/document/convert', () => {
    const contentTypes = Object.values(DOCUMENT_CONTENT_TYPE);

    contentTypes.forEach((fromType) => {
      contentTypes.forEach((toType) => {
        it(`converts from ${fromType} to ${toType}`, () => {
          return request(app.getHttpServer())
            .post('/v1/document/convert')
            .set('Content-Type', fromType)
            .set('Accept', toType)
            .send(DOCUMENT_FIXTURES[fromType] || '')
            .expect(200)
            .expect((res) => {
              expect(stripCharset(res.headers['content-type'])).toBe(toType);
              expect(normalizeDocument(res.text)).toEqual(
                normalizeDocument(DOCUMENT_FIXTURES[toType]),
              );
            });
        });
      });
    });

    it('should format output when format=true', () => {
      return request(app.getHttpServer())
        .post('/v1/document/convert')
        .set('Content-Type', DOCUMENT_CONTENT_TYPE.APPLICATION_JSON)
        .set('Accept', DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12)
        .query({ format: true })
        .send({ FOO: [{ FOO1: '123' }], BAR: [{ BAR1: 'abc' }] })
        .expect(200)
        .expect((res) => {
          expect(stripCharset(res.headers['content-type'])).toBe(
            DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12,
          );
          expect(res.text).toEqual('FOO*123~\nBAR*abc~');
        });
    });

    it('should not format output when format=false', () => {
      return request(app.getHttpServer())
        .post('/v1/document/convert')
        .set('Content-Type', DOCUMENT_CONTENT_TYPE.APPLICATION_JSON)
        .set('Accept', DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12)
        .query({ format: false })
        .send({ FOO: [{ FOO1: '123' }], BAR: [{ BAR1: 'abc' }] })
        .expect(200)
        .expect((res) => {
          expect(stripCharset(res.headers['content-type'])).toBe(
            DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12,
          );
          expect(res.text).toEqual('FOO*123~BAR*abc~');
        });
    });

    it('should parse with custom separators', () => {
      return request(app.getHttpServer())
        .post('/v1/document/convert')
        .set('Content-Type', DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12)
        .set('Accept', DOCUMENT_CONTENT_TYPE.APPLICATION_JSON)
        .query({
          elementSeparator: '|',
          segmentSeparator: '#',
          format: 'false',
        })
        .send('FOO|123#BAR|abc#')
        .expect(200)
        .expect((res) => {
          expect(stripCharset(res.headers['content-type'])).toBe(
            DOCUMENT_CONTENT_TYPE.APPLICATION_JSON,
          );
          expect(res.text).toEqual(
            JSON.stringify({
              FOO: [{ FOO1: '123' }],
              BAR: [{ BAR1: 'abc' }],
            }),
          );
        });
    });

    it('should serialize with custom separators', () => {
      return request(app.getHttpServer())
        .post('/v1/document/convert')
        .set('Content-Type', DOCUMENT_CONTENT_TYPE.APPLICATION_JSON)
        .set('Accept', DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12)
        .query({
          elementSeparator: '|',
          segmentSeparator: '#',
          format: false,
        })
        .send({ FOO: [{ FOO1: '123' }], BAR: [{ BAR1: 'abc' }] })
        .expect(200)
        .expect((res) => {
          expect(stripCharset(res.headers['content-type'])).toBe(
            DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12,
          );
          expect(res.text).toEqual('FOO|123#BAR|abc#');
        });
    });

    it('should throw an error for unsupported content type', () => {
      return request(app.getHttpServer())
        .post('/v1/document/convert')
        .set('Content-Type', 'unsupported/type')
        .set('Accept', DOCUMENT_CONTENT_TYPE.APPLICATION_JSON)
        .send('')
        .expect(400);
    });
  });
});
