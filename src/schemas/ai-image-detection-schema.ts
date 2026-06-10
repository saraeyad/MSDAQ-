import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const aiImageDetectionSchema = z.object({
  image_file: z
    .any()
    .refine((file): file is File => file instanceof File, {
      message: "Image file is required",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Image must be 5 MB or smaller",
    }),
});

export type AiImageDetectionSchemaType = z.infer<typeof aiImageDetectionSchema>;
