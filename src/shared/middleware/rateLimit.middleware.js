// src/shared/middleware/rateLimit.middleware.js

import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { rateLimitRedis } from "../config/redis.config.js";

// Use centralized Redis client for rate limiting
const redis = rateLimitRedis;

// Handle Redis connection errors
redis.on("error", err => {
	console.warn("Redis connection error for rate limiting:", err.message);
});

redis.on("connect", () => {
	console.log("Redis connected for rate limiting");
});

const max = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

export const apiRateLimiter = rateLimit({
	store: new RedisStore({
		sendCommand: (...args) => redis.call(...args),
	}),
	windowMs,
	max,
	message: {
		statusCode: 429,
		success: false,
		message: process.env.RATE_LIMIT_MESSAGE || "Too many requests. Please try again later.",
	},
	standardHeaders: "draft-7",
	legacyHeaders: false,
	keyGenerator: req => {
		return req.ip || req.socket?.remoteAddress || "unknown";
	},
	skip: req => {
		// Skip rate limiting for health checks
		return req.path === "/health" || req.path === "/api/v2";
	},
});
