// src/modules/admin/services/redis.service.js
import { cacheRedis } from "../../../shared/config/redis.config.js";

class RedisCacheService {
	constructor() {
		this.redis = redisClient;
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
			await this.redis.set(key, serialized, "EX", ttlSeconds);
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
