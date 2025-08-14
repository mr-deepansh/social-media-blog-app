// src/shared/utils/ErrorHandler.js
import { ApiError } from "./ApiError.js";

export const safeAsyncOperation = async (operation, fallback = null) => {
	try {
		return await operation();
	} catch (error) {
		return fallback;
	}
};

export const handleControllerError = (error, req, res, startTime, logger) => {
	const executionTime = Date.now() - startTime;
	logger.error("Controller error", {
		error: error.message,
		stack: error.stack,
		executionTime,
	});

	if (error instanceof ApiError) {
		throw error;
	}

	throw new ApiError(500, `Operation failed: ${error.message}`);
};
