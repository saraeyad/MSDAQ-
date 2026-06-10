import { z } from "zod";

export const imageVerificationSchema = z.object({
  image_url: z.string().url({ message: "Invalid URL" }),
});

export type ImageVerificationSchemaType = z.infer<typeof imageVerificationSchema>;
