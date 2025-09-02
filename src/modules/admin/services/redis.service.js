// src/modules/admin/services/redis.service.js
import Redis from "ioredis";

class RedisCacheService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn("Redis get error:", error.message);
      return null;
    }
  }

  async set(key, data, ttlSeconds = 300) {
    try {
      const serialized = JSON.stringify(data);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.warn("Redis set error:", error.message);
      return false;
    }
  }

  async del(key) {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.warn("Redis del error:", error.message);
      return false;
    }
  }
}

export const cache = new RedisCacheService();
