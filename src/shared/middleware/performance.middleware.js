// src/shared/middleware/performance.middleware.js
/**
 * Enterprise-grade performance monitoring middleware
 * @version 2.0.0
 * @author Deepansh Gangwar
 */

import { logger } from "../services/logger.service.js";

/**
 * Request timing and performance monitoring
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function (data) {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    // Log performance metrics
    const performanceData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
      memoryUsage: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      userId: req.user?._id,
    };

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn("Slow request detected", performanceData);
    } else if (responseTime > 500) {
      logger.info("Performance monitoring", performanceData);
    }

    // Add performance headers
    res.set("X-Response-Time", `${responseTime.toFixed(2)}ms`);
    res.set("X-Memory-Usage", `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Memory usage monitor
 */
export const memoryMonitor = (req, res, next) => {
  const memUsage = process.memoryUsage();
  const memoryThreshold = 500 * 1024 * 1024; // 500MB

  if (memUsage.heapUsed > memoryThreshold) {
    logger.warn("High memory usage detected", {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`,
      url: req.originalUrl,
    });
  }

  next();
};

/**
 * Request size monitor
 */
export const requestSizeMonitor = (req, res, next) => {
  const contentLength = parseInt(req.get("content-length") || "0");

  if (contentLength > 0) {
    logger.info("Request size", {
      size: `${(contentLength / 1024).toFixed(2)}KB`,
      url: req.originalUrl,
      method: req.method,
    });
  }

  next();
};
