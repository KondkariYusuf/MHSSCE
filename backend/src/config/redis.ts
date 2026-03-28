import IORedis from "ioredis";
import { env } from "./env";

export const createRedisConnection = (): IORedis => {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
};
