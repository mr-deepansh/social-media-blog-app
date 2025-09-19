// src/shared/utils/sessionManager.js
import redisClient from "../config/redis.config.js";

export const setSession = async (userId, platform, token) => {
	try {
		await redisClient.set(`user:${userId}:${platform}`, token);
	} catch (error) {
		throw new Error(`Failed to set session: ${error.message}`);
	}
};

export const getSession = async (userId, platform) => {
	try {
		return await redisClient.get(`user:${userId}:${platform}`);
	} catch (error) {
		throw new Error(`Failed to get session: ${error.message}`);
	}
};

export const invalidateSession = async (userId, platform) => {
	try {
		await redisClient.del(`user:${userId}:${platform}`);
	} catch (error) {
		throw new Error(`Failed to invalidate session: ${error.message}`);
	}
};
