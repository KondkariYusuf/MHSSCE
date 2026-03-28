import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { attachRequestId } from "./core/middleware/request-id";
import { errorHandler } from "./core/middleware/error-handler";
import { notFoundHandler } from "./core/middleware/not-found";
import { httpLogger } from "./core/utils/logger";
import { authRoutes } from "./modules/auth/auth.routes";
import { documentsRoutes } from "./modules/documents/documents.routes";
import { webhooksRoutes } from "./modules/webhooks/webhooks.routes";

export const app = express();

app.disable("x-powered-by");
app.use(httpLogger);
app.use(attachRequestId);
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN ?? true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString()
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/webhooks", webhooksRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
