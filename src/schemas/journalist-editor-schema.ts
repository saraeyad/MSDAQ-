import { z } from "zod";

export const journalistEditorSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(20),
  tags: z.string().optional(),
  coverImage: z.custom<File | null | undefined>().optional(),
});

export type JournalistEditorSchemaType = z.infer<typeof journalistEditorSchema>;
