import { z } from 'zod';

export const ElementSchema = z.object({
  value: z.string(),
});
export type Element = z.infer<typeof ElementSchema>;

export const SegmentSchema = z.object({
  name: z.string(),
  elements: z.array(ElementSchema),
});
export type Segment = z.infer<typeof SegmentSchema>;

export const DocumentSchema = z.object({
  segments: z.array(SegmentSchema),
});
export type Document = z.infer<typeof DocumentSchema>;

export const DOCUMENT_CONTENT_TYPE = {
  APPLICATION_JSON: 'application/json',
  APPLICATION_EDI_X12: 'application/edi-x12',
  APPLICATION_XML: 'application/xml',
} as const;

export type DocumentContentType =
  (typeof DOCUMENT_CONTENT_TYPE)[keyof typeof DOCUMENT_CONTENT_TYPE];
