import type { Worker } from "bullmq";
import { logger } from "../core/utils/logger";
import { closeQueues } from "./queues";
import { scheduleDailyExpiryChecker } from "./scheduler";
import { createExpiryWorker } from "./workers/expiry.worker";
import { createNotificationWorker } from "./workers/notification.worker";

let workers: Worker[] = [];

const start = async (): Promise<void> => {
  await scheduleDailyExpiryChecker();

  workers = [createExpiryWorker(), createNotificationWorker()];

  logger.info("Workers started and daily expiry scheduler registered");
};

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, closing workers`);

  await Promise.all(workers.map((worker) => worker.close()));
  await closeQueues();

  process.exit(0);
};

start().catch((error) => {
  logger.error("Failed to start workers", error);
  process.exit(1);
});

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
