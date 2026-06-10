import { z } from "zod";

export const credibilityCheckSchema = z.object({
  content: z.string().min(50),
});

export type CredibilityCheckSchemaType = z.infer<typeof credibilityCheckSchema>;
