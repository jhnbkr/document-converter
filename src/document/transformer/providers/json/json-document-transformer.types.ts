import { z } from 'zod';

export const JsonDocumentSchema = z
  .record(z.string(), z.array(z.record(z.string(), z.string())))
  .refine(
    (doc) =>
      Object.entries(doc).every(([segmentName, segments]) =>
        segments.every((segment) =>
          Object.entries(segment).every(
            ([elementName, _value], index) =>
              elementName === `${segmentName}${index + 1}`,
          ),
        ),
      ),
    {
      message:
        'Element names must follow the pattern: {segmentName}{index}, starting from 1',
    },
  );

export type JsonDocument = z.infer<typeof JsonDocumentSchema>;
