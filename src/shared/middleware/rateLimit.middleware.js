// src/shared/middleware/rateLimit.middleware.js

import rateLimit from "express-rate-limit";
import { config } from "dotenv";

// Load environment variables
config();

const max = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  message: {
    statusCode: 429,
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
