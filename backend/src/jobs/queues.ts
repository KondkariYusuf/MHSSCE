import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis";
import { QUEUE_NAMES } from "./queue-names";
import type { ExpiryCheckJobData, NotificationJobData, WorkflowNotificationJobData } from "./types";

const connection = createRedisConnection();

export const expiryCheckQueue = new Queue<ExpiryCheckJobData>(QUEUE_NAMES.EXPIRY_CHECK, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000
    }
  }
});

export const notificationQueue = new Queue<NotificationJobData>(QUEUE_NAMES.NOTIFICATION, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 500,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  }
});

export const workflowNotificationQueue = new Queue<WorkflowNotificationJobData>(QUEUE_NAMES.WORKFLOW_NOTIFICATION, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000
    }
  }
});

export const closeQueues = async (): Promise<void> => {
  await Promise.all([
    expiryCheckQueue.close(),
    notificationQueue.close(),
    workflowNotificationQueue.close(),
    connection.quit()
  ]);
};
