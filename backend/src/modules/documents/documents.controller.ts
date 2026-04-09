import type { Request, Response } from "express";
import { generateUploadUrlSchema } from "./documents.schemas";
import { documentService } from "./documents.service";
import { workflowNotificationQueue } from "../../jobs/queues";
import { logger } from "../../core/utils/logger";

export const documentsController = {
  generateUploadUrl: async (req: Request, res: Response) => {
    const payload = generateUploadUrlSchema.parse(req.body);
    const instituteId = req.auth?.profile.institute_id ?? null;
    const uploaderName = req.auth?.profile.full_name ?? "Unknown";

    const result = await documentService.generateUploadUrl(payload, instituteId);

    // Dispatch workflow notification: Clerk uploads → Notify HOD & Principal
    // Non-blocking — don't crash the upload if Redis is down
    if (instituteId) {
      try {
        await workflowNotificationQueue.add(
          "workflow-notification",
          {
            event: "document_uploaded",
            documentId: result.documentId,
            documentName: payload.filename,
            instituteId,
            actorName: uploaderName,
            actorRole: "Clerk"
          }
        );
      } catch (err) {
        logger.warn({ error: err instanceof Error ? err.message : "Unknown" }, "Failed to queue workflow notification (Redis may be down)");
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  }
};
