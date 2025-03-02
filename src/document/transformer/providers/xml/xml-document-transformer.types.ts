import { z } from 'zod';

export const XmlDocumentSchema = z.object({
  root: z
    .record(
      z.array(
        z
          .union([z.string(), z.record(z.string())])
          .transform((value) => (typeof value === 'string' ? {} : value)),
      ),
    )
    .refine(
      (root) => {
        return Object.entries(root).every(([segmentName, elements]) => {
          if (elements.length === 0) return true; // Allow empty segments

          return elements.every((element) => {
            if (Object.keys(element).length === 0) return true; // Allow empty elements

            // Validate element names follow pattern: segmentName1, segmentName2, etc.
            return Object.keys(element).every((key, index) => {
              const expectedKey = `${segmentName}${index + 1}`;
              return key === expectedKey;
            });
          });
        });
      },
      { message: 'Invalid XML segment structure' },
    ),
});

export type XmlDocument = z.infer<typeof XmlDocumentSchema>;
