import { z } from "zod";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"] as const;

export const generateUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  fileType: z.enum(allowedMimeTypes),
  fileSize: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES)
});

export type GenerateUploadUrlInput = z.infer<typeof generateUploadUrlSchema>;
