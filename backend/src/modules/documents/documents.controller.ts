import type { Request, Response } from "express";
import { generateUploadUrlSchema } from "./documents.schemas";
import { documentService } from "./documents.service";

export const documentsController = {
  generateUploadUrl: async (req: Request, res: Response) => {
    const payload = generateUploadUrlSchema.parse(req.body);
    const instituteId = req.auth?.profile.institute_id ?? null;

    const result = await documentService.generateUploadUrl(payload, instituteId);

    res.status(200).json({
      success: true,
      data: result
    });
  }
};
