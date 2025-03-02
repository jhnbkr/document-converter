import { DocumentTransformerOptions } from '../interfaces';

export const DEFAULT_ELEMENT_SEPARATOR = '*';
export const DEFAULT_SEGMENT_SEPARATOR = '~';
export const DEFAULT_DOCUMENT_TRANSFORMER_OPTIONS: DocumentTransformerOptions =
  {
    elementSeparator: DEFAULT_ELEMENT_SEPARATOR,
    segmentSeparator: DEFAULT_SEGMENT_SEPARATOR,
    format: true,
    trimElements: true,
  };
