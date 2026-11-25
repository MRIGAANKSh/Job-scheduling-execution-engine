import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { logger } from "./utils/logger.js";

const app = express();

// Security headers
app.use(helmet());

// Cross-origin configuration
app.use(cors());

// Request body parsing
app.use(express.json({ limit: "1mb" }));

// HTTP request logging
app.use(
  pinoHttp({
    logger,
  }),
);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Scheduling & Execution Engine API",
    version: "1.0.0",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default app;