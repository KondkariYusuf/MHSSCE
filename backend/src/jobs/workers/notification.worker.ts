import { Worker } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { logger } from "../../core/utils/logger";
import { QUEUE_NAMES } from "../queue-names";
import type { NotificationJobData } from "../types";

const prettyBanner = (title: string): string => {
  const border = "=".repeat(72);
  return `\n${border}\n${title}\n${border}`;
};

const renderMilestone = (milestone: NotificationJobData["milestone"]): string => {
  switch (milestone) {
    case "THREE_MONTHS":
      return "3 Months Before Expiry";
    case "ONE_MONTH":
      return "1 Month Before Expiry";
    case "EXACT_DAY":
      return "Expiry Day";
    default:
      return milestone;
  }
};

export const createNotificationWorker = (): Worker<NotificationJobData> => {
  return new Worker<NotificationJobData>(
    QUEUE_NAMES.NOTIFICATION,
    async (job) => {
      const payload = job.data;
      const milestoneLabel = renderMilestone(payload.milestone);

      logger.info({ banner: prettyBanner("AICP NOTIFICATION JOB") }, "Notification dispatch start");
      logger.info(
        {
          jobId: job.id,
          documentId: payload.documentId,
          instituteId: payload.instituteId,
          documentName: payload.documentName,
          expiryDate: payload.expiryDate,
          milestone: milestoneLabel,
          daysRemaining: payload.daysUntilExpiry,
          provider: "mock-adapter",
          delivery: "simulated-success"
        },
        "Notification job processed"
      );

      return { sent: true };
    },
    {
      connection: createRedisConnection(),
      concurrency: 5
    }
  );
};
