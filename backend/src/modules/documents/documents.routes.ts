import { Router } from "express";
import { authenticate } from "../../core/middleware/auth";
import { authorizeRoles } from "../../core/middleware/rbac";
import { asyncHandler } from "../../core/utils/async-handler";
import { documentsController } from "./documents.controller";

const router = Router();

router.post(
  "/generate-upload-url",
  authenticate,
  authorizeRoles("Clerk"),
  asyncHandler(documentsController.generateUploadUrl)
);

export { router as documentsRoutes };
