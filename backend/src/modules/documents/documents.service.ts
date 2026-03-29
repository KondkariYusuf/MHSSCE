import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { supabaseAdmin } from "../../config/supabase";
import { AppError } from "../../core/errors/AppError";
import type { GenerateUploadUrlInput } from "./documents.schemas";

const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, "-");
};

export const documentService = {
  /**
   * @security ⚠️  RLS BYPASS WARNING ⚠️
   *
   * This function uses `supabaseAdmin` (service-role key) to generate
   * a signed upload URL. The service-role key **completely bypasses**
   * PostgreSQL Row Level Security (RLS).
   *
   * This means:
   *  - The storage operation is NOT subject to any RLS policies.
   *  - There is NO automatic authorization check at the database level.
   *
   * ⛔  Any route that calls this service MUST:
   *  1. Authenticate the user via the `authenticate` middleware.
   *  2. Authorize the user's role via the `authorizeRoles` middleware.
   *  3. Validate the request payload via Zod schemas in the controller.
   *
   * Never expose this function to unauthenticated or unauthorized callers.
   */
  generateUploadUrl: async (
    payload: GenerateUploadUrlInput,
    instituteId: string | null
  ): Promise<{ documentId: string; uploadUrl: string; securePath: string }> => {
    if (!instituteId) {
      throw new AppError("Authenticated user has no institute mapping", 403);
    }

    const documentId = randomUUID();
    const safeFilename = sanitizeFilename(payload.filename);
    const securePath = `${instituteId}/${documentId}/${safeFilename}`;

    const { data, error } = await supabaseAdmin
      .storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUploadUrl(securePath);

    if (error || !data) {
      throw new AppError("Failed to generate signed upload URL", 500, error?.message);
    }

    return {
      documentId,
      uploadUrl: data.signedUrl,
      securePath
    };
  }
};
