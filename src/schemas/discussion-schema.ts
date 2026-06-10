import { z } from "zod";

export const discussionPostSchema = z
  .object({
    content: z.string().trim().min(2).max(2000),
    isAnonymous: z.boolean(),
    displayName: z.string().trim().max(50).optional(),
  })
  .refine((data) => !data.isAnonymous || !data.displayName, {
    message: "Display name cannot be sent when posting anonymously",
    path: ["displayName"],
  });

export type DiscussionPostSchemaType = z.infer<typeof discussionPostSchema>;

export const discussionCommentSchema = z
  .object({
    content: z.string().trim().min(2).max(2000),
    isAnonymous: z.boolean(),
    displayName: z.string().trim().max(100).optional(),
  })
  .refine((data) => !data.isAnonymous || !data.displayName, {
    message: "Display name cannot be sent when commenting anonymously",
    path: ["displayName"],
  });

export type DiscussionCommentSchemaType = z.infer<typeof discussionCommentSchema>;
