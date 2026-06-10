import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const imageOrPdfFile = z
  .instanceof(File, { message: "File is required" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "File must be 5MB or less",
  })
  .refine(
    (file) =>
      file.type.startsWith("image/") || file.type === "application/pdf",
    { message: "File must be an image or PDF" },
  );

const optionalImageOrPdfFile = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "File must be 5MB or less",
  })
  .refine(
    (file) =>
      file.type.startsWith("image/") || file.type === "application/pdf",
    { message: "File must be an image or PDF" },
  )
  .optional()
  .nullable();

export const journalistRequestSchema = z
  .object({
    full_name: z.string().trim().min(2),
    address_city: z.string().trim().min(2),
    address_country: z.string().min(2),
    affiliation_type: z.enum(["affiliated", "independent"]),
    outlet_name: z.string().optional(),
    id_photo: imageOrPdfFile,
    journalism_proof: optionalImageOrPdfFile,
  })
  .superRefine((data, ctx) => {
    if (data.affiliation_type === "affiliated" && !data.outlet_name?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Outlet name is required for affiliated journalists",
        path: ["outlet_name"],
      });
    }
  });

export type JournalistRequestSchemaType = z.infer<typeof journalistRequestSchema>;
