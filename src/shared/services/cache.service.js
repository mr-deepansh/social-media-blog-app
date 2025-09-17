// src/shared/services/cache.service.js
import { cacheRedis } from "../config/redis.config.js";

class CacheService {
	constructor() {
		this.redis = cacheRedis;
	}

	async get(key) {
		try {
			const data = await this.redis.get(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.warn(`Cache get error for key ${key}:`, error.message);
			return null;
		}
	}

	async set(key, data, ttl = 300) {
		try {
			const serializedData = typeof data === "string" ? data : JSON.stringify(data);
			await this.redis.setex(key, ttl, serializedData);
			return true;
		} catch (error) {
			console.warn(`Cache set error for key ${key}:`, error.message);
			return false;
		}
	}

	async del(key) {
		try {
			await this.redis.del(key);
			return true;
		} catch (error) {
			console.warn(`Cache delete error for key ${key}:`, error.message);
			return false;
		}
	}

	async deletePattern(pattern) {
		try {
			const keys = await this.redis.keys(pattern);
			if (keys.length > 0) {
				await this.redis.del(...keys);
			}
			return true;
		} catch (error) {
			console.warn(`Cache delete pattern error for ${pattern}:`, error.message);
			return false;
		}
	}

	async setex(key, ttl, data) {
		return this.set(key, data, ttl);
	}
}

export const cacheService = new CacheService();
export { CacheService };
