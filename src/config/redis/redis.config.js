// src/config/redis/redis.config.js
import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  lazyConnect: true,
  family: 4,
  keepAlive: true,
  retryStrategy: times => Math.min(times * 50, 2000),
};

let redisClient;

try {
  redisClient = new Redis(redisConfig);

  redisClient.on("connect", () => console.log("Redis connected"));
  redisClient.on("error", err => console.error("Redis error:", err));
} catch (error) {
  console.error("Failed to initialize Redis:", error);
}

const RedisUtils = {
  async setWithTTL(key, value, ttlSeconds = 3600) {
    try {
      const serializedValue =
				typeof value === "object" ? JSON.stringify(value) : value;
      return await redisClient.setex(key, ttlSeconds, serializedValue);
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  },

  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (!value) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },

  async deletePattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        return await redisClient.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error(`Redis DELETE pattern error for ${pattern}:`, error);
      throw error;
    }
  },

  getConnectionStatus() {
    return {
      status: redisClient.status,
      connected: redisClient.status === "ready",
      uptime: process.uptime(),
    };
  },
};

export { redisClient, RedisUtils };
