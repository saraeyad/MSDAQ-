import { z } from "zod";

export const standardsCheckSchema = z.object({
  content: z.string().min(50),
});

export type StandardsCheckSchemaType = z.infer<typeof standardsCheckSchema>;
