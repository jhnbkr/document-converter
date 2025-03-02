import { readFileSync } from 'fs';
import { join } from 'path';

import { DOCUMENT_CONTENT_TYPE, DocumentContentType } from '@document/types';

export const FIXTURES_DIR = join(__dirname);

const readFixture = (filename: string) => {
  return readFileSync(join(FIXTURES_DIR, filename), 'utf-8');
};

export const DOCUMENT_FIXTURES: Record<DocumentContentType, string> = {
  [DOCUMENT_CONTENT_TYPE.APPLICATION_JSON]: readFixture('document-sample.json'),
  [DOCUMENT_CONTENT_TYPE.APPLICATION_EDI_X12]: readFixture(
    'document-sample.x12',
  ),
  [DOCUMENT_CONTENT_TYPE.APPLICATION_XML]: readFixture('document-sample.xml'),
} as const;
