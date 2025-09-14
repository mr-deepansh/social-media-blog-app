// src/shared/utils/Cache.js
import { redisManager } from "../../config/redis/redis.optimized.js";

export class CacheService {
	static async get(key) {
		return await redisManager.get(key);
	}

	static async set(key, value, ttl = 3600) {
		return await redisManager.set(key, value, ttl);
	}

	static async del(key) {
		return await redisManager.del(key);
	}

	static async exists(key) {
		return await redisManager.exists(key);
	}

	// User-specific cache operations
	static async cacheUser(userId, userData, ttl = 300) {
		return await this.set(`user:${userId}`, userData, ttl);
	}

	static async getCachedUser(userId) {
		return await this.get(`user:${userId}`);
	}

	static async invalidateUser(userId) {
		return await this.del(`user:${userId}`);
	}

	// Rate limiting
	static async incrementRateLimit(key, ttl = 3600) {
		return await redisManager.incr(key, ttl);
	}

	// Session management
	static async blacklistToken(token, ttl = 86400) {
		return await this.set(`blacklist:${token}`, true, ttl);
	}

	static async isTokenBlacklisted(token) {
		return await this.exists(`blacklist:${token}`);
	}
}
