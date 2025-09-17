// src/shared/config/redis.config.js
import Redis from "ioredis";

const DEFAULT_REDIS_PASSWORD = "administer"; // Must match your .env and Redis server password

// Centralized Redis configuration
const redisConfig = {
	host: process.env.REDIS_HOST || "localhost",
	port: parseInt(process.env.REDIS_PORT) || 6379,
	password: process.env.REDIS_PASSWORD || DEFAULT_REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_DB) || 0,
	keyPrefix: process.env.REDIS_KEY_PREFIX || "",
	retryStrategy: times => {
		if (times > 10) {
			console.error("Redis connection failed after 10 retries");
			return null; // stop retrying
		}
		const delay = Math.min(times * 200, 3000); // exponential backoff
		return delay;
	},
	maxRetriesPerRequest: 3,
	lazyConnect: false, // Changed to false to fail fast if connection issues
	connectTimeout: 10000,
	commandTimeout: 5000,
	enableReadyCheck: true,
	showFriendlyErrorStack: process.env.NODE_ENV !== "production",
	tls: process.env.REDIS_TLS === "true" ? {} : undefined,
	reconnectOnError(err) {
		const targetError = "READONLY";
		if (err.message.includes(targetError)) {
			return true; // reconnect if readonly error
		}
		return false;
	},
};

// Create Redis client instance
export const createRedisClient = (options = {}) => {
	const client = new Redis({
		...redisConfig,
		...options,
	});

	// Add error handling
	client.on("error", err => {
		console.warn(`Redis error (${options.keyPrefix || "default"}):`, err.message);
	});

	client.on("connect", () => {
		console.log(`Redis connected (${options.keyPrefix || "default"})`);
	});

	// Add ready handling
	client.on("ready", () => {
		console.log(`Redis ready (${options.keyPrefix || "default"})`);
	});

	client.on("reconnecting", () => {
		console.log(`Redis reconnecting (${options.keyPrefix || "default"})`);
	});

	// Handle connection close
	client.on("end", () => {
		console.log(`Redis connection closed (${options.keyPrefix || "default"})`);
	});

	return client;
};

// Lazy initialization of Redis clients
let _redisClient;
let _rateLimitRedis;
let _cacheRedis;
let _sessionRedis;

export const redisClient = () => {
	if (!_redisClient) {
		_redisClient = createRedisClient();
	}
	return _redisClient;
};

export const rateLimitRedis = (() => {
	if (!_rateLimitRedis) {
		_rateLimitRedis = createRedisClient({
			keyPrefix: "rate-limit:",
		});
	}
	return _rateLimitRedis;
})();

export const cacheRedis = (() => {
	if (!_cacheRedis) {
		_cacheRedis = createRedisClient({
			keyPrefix: "cache:",
		});
	}
	return _cacheRedis;
})();

export const sessionRedis = (() => {
	if (!_sessionRedis) {
		_sessionRedis = createRedisClient({
			keyPrefix: "session:",
		});
	}
	return _sessionRedis;
})();

export default redisConfig;
