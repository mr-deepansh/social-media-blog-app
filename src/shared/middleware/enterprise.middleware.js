/**
 * Enterprise Middleware Suite
 * Production-ready middleware for scalability
 */

import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Request ID Middleware
export const requestId = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.id);
  next();
};

// Performance Monitoring
export const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
			`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

// Enhanced Rate Limiting
export const enterpriseRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Enterprise limit
  message: {
    error: "Too many requests",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security Headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Response Compression
export const responseCompression = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
});

// CORS Configuration
export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Error Sanitization
export const sanitizeError = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  const sanitized = {
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString(),
    requestId: req.id,
    ...(isDev && { stack: err.stack }),
  };

  res.status(sanitized.statusCode).json(sanitized);
};

export default {
  requestId,
  performanceMonitor,
  enterpriseRateLimit,
  securityHeaders,
  responseCompression,
  corsConfig,
  sanitizeError,
};
