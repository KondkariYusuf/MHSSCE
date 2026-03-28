import { supabaseAdmin } from "../../config/supabase";
import { logger } from "../../core/utils/logger";
import { notificationQueue } from "../queues";
import type { NotificationJobData } from "../types";

type DocStatus = "Valid" | "Expiring Soon" | "Expired";

interface DocumentRow {
  id: string;
  institute_id: string;
  document_name: string;
  expiry_date: string;
  status: DocStatus;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfUtcDay = (value: Date): Date => {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
};

const getDaysUntilExpiry = (expiryDateIso: string, now: Date): number => {
  const today = startOfUtcDay(now).getTime();
  const expiry = startOfUtcDay(new Date(expiryDateIso)).getTime();
  return Math.floor((expiry - today) / MS_PER_DAY);
};

const calculateStatus = (daysUntilExpiry: number): DocStatus => {
  if (daysUntilExpiry < 0) {
    return "Expired";
  }

  if (daysUntilExpiry <= 90) {
    return "Expiring Soon";
  }

  return "Valid";
};

const milestoneForDay = (
  daysUntilExpiry: number
): NotificationJobData["milestone"] | null => {
  if (daysUntilExpiry === 90) {
    return "THREE_MONTHS";
  }

  if (daysUntilExpiry === 30) {
    return "ONE_MONTH";
  }

  if (daysUntilExpiry === 0) {
    return "EXACT_DAY";
  }

  return null;
};

export const runDailyExpiryCheck = async (): Promise<{
  scanned: number;
  updated: number;
  notificationsQueued: number;
}> => {
  const now = new Date();
  const ninetyDaysFromNow = startOfUtcDay(
    new Date(now.getTime() + 90 * MS_PER_DAY)
  ).toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("id, institute_id, document_name, expiry_date, status")
    .lte("expiry_date", ninetyDaysFromNow)
    .returns<DocumentRow[]>();

  if (error) {
    throw new Error(`Failed to fetch documents for expiry checker: ${error.message}`);
  }

  const documents = data ?? [];

  let updated = 0;
  let notificationsQueued = 0;

  for (const doc of documents) {
    const daysUntilExpiry = getDaysUntilExpiry(doc.expiry_date, now);
    const nextStatus = calculateStatus(daysUntilExpiry);

    if (nextStatus !== doc.status) {
      const { error: updateError } = await supabaseAdmin
        .from("documents")
        .update({ status: nextStatus })
        .eq("id", doc.id);

      if (updateError) {
        logger.error(
          {
            documentId: doc.id,
            error: updateError.message
          },
          "Failed to update document status"
        );
      } else {
        updated += 1;
      }
    }

    const milestone = milestoneForDay(daysUntilExpiry);
    if (!milestone) {
      continue;
    }

    await notificationQueue.add(
      "document-expiry-notification",
      {
        documentId: doc.id,
        instituteId: doc.institute_id,
        documentName: doc.document_name,
        expiryDate: doc.expiry_date,
        daysUntilExpiry,
        milestone
      },
      {
        jobId: `${doc.id}:${milestone}:${startOfUtcDay(now).toISOString().slice(0, 10)}`
      }
    );

    notificationsQueued += 1;
  }

  return {
    scanned: documents.length,
    updated,
    notificationsQueued
  };
};
