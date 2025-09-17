// src/shared/middleware/performance.middleware.js

import compression from "compression";
import slowDown from "express-slow-down";
import { performanceConfig } from "../../config/performance.config.js";

// Compression middleware for better performance
export const compressionMiddleware = compression({
	level: performanceConfig.compression.level,
	threshold: performanceConfig.compression.threshold,
	filter: performanceConfig.compression.filter,
	chunkSize: 16 * 1024, // 16KB chunks
	windowBits: 15,
	memLevel: 8,
});

// Slow down middleware to prevent abuse
export const slowDownMiddleware = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutes
	delayAfter: 100, // Allow 100 requests per windowMs without delay
	delayMs: hits => hits * 100, // Add 100ms delay per request after delayAfter
	maxDelayMs: 20000, // Max delay of 20 seconds
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
	keyGenerator: req => req.ip,
	skip: req => {
		// Skip for health checks and static assets
		return req.path === "/health" || req.path.startsWith("/static/") || req.path.startsWith("/assets/");
	},
});

// Response time middleware
export const responseTimeMiddleware = (req, res, next) => {
	const start = process.hrtime.bigint();

	res.on("finish", () => {
		const end = process.hrtime.bigint();
		const duration = Number(end - start) / 1000000; // Convert to milliseconds

		res.set("X-Response-Time", `${duration.toFixed(2)}ms`);

		// Log slow requests (>1000ms)
		if (duration > 1000) {
			console.warn(`Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
		}
	});

	next();
};

// Memory usage middleware
export const memoryMonitorMiddleware = (req, res, next) => {
	const memUsage = process.memoryUsage();
	const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

	// Add memory info to response headers (development only)
	if (process.env.NODE_ENV === "development") {
		res.set("X-Memory-Usage", `${heapUsedMB}MB`);
	}

	// Warn if memory usage is high
	if (heapUsedMB > 1500) {
		// 1.5GB
		console.warn(`High memory usage: ${heapUsedMB}MB`);
	}

	next();
};

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
	const contentLength = parseInt(req.get("content-length") || "0");
	const maxSize = 50 * 1024 * 1024; // 50MB max request size

	if (contentLength > maxSize) {
		return res.status(413).json({
			error: "Request entity too large",
			maxSize: "50MB",
			receivedSize: `${Math.round(contentLength / 1024 / 1024)}MB`,
		});
	}

	next();
};

// Connection limiter per IP
const connectionCounts = new Map();

export const connectionLimiter = (req, res, next) => {
	const ip = req.ip;
	const maxConnections = 100; // Max 100 concurrent connections per IP

	const currentConnections = connectionCounts.get(ip) || 0;

	if (currentConnections >= maxConnections) {
		return res.status(429).json({
			error: "Too many concurrent connections",
			maxConnections,
			currentConnections,
		});
	}

	// Increment connection count
	connectionCounts.set(ip, currentConnections + 1);

	// Decrement on response finish
	res.on("finish", () => {
		const count = connectionCounts.get(ip) || 0;
		if (count <= 1) {
			connectionCounts.delete(ip);
		} else {
			connectionCounts.set(ip, count - 1);
		}
	});

	next();
};

// Graceful shutdown handler
export const gracefulShutdown = server => {
	const shutdown = signal => {
		console.log(`Received ${signal}. Starting graceful shutdown...`);

		server.close(err => {
			if (err) {
				console.error("Error during server shutdown:", err);
				process.exit(1);
			}

			console.log("Server closed successfully");
			process.exit(0);
		});

		// Force shutdown after 30 seconds
		setTimeout(() => {
			console.error("Forced shutdown after timeout");
			process.exit(1);
		}, 30000);
	};

	process.on("SIGTERM", () => shutdown("SIGTERM"));
	process.on("SIGINT", () => shutdown("SIGINT"));
};

export default {
	compressionMiddleware,
	slowDownMiddleware,
	responseTimeMiddleware,
	memoryMonitorMiddleware,
	requestSizeLimiter,
	connectionLimiter,
	gracefulShutdown,
};
