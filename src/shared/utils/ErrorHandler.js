// src/shared/utils/ErrorHandler.js
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

/**
 * Global error handler for Express applications
 */
export const globalErrorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;
	// Log error
	console.error("Error:", {
		message: err.message,
		stack: err.stack,
		url: req.originalUrl,
		method: req.method,
		ip: req.ip,
		timestamp: new Date().toISOString(),
	});
	// Mongoose bad ObjectId
	if (err.name === "CastError") {
		const message = "Resource not found";
		error = new ApiError(404, message);
	}
	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = "Duplicate field value entered";
		error = new ApiError(400, message);
	}
	// Mongoose validation error
	if (err.name === "ValidationError") {
		const message = Object.values(err.errors)
			.map((val) => val.message)
			.join(", ");
		error = new ApiError(400, message);
	}
	// JWT errors
	if (err.name === "JsonWebTokenError") {
		const message = "Invalid token";
		error = new ApiError(401, message);
	}
	if (err.name === "TokenExpiredError") {
		const message = "Token expired";
		error = new ApiError(401, message);
	}
	res
		.status(error.statusCode || 500)
		.json(
			new ApiResponse(
				error.statusCode || 500,
				error.data || null,
				error.message || "Internal Server Error",
				false,
			),
		);
};

/**
 * Handle async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
	const error = new ApiError(404, `Route ${req.originalUrl} not found`);
	next(error);
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (errors) => {
	const errorMessages = errors.map((error) => ({
		field: error.path,
		message: error.msg,
		value: error.value,
	}));

	throw new ApiError(400, "Validation failed", errorMessages);
};

/**
 * Database connection error handler
 */
export const handleDatabaseError = (error) => {
	console.error("Database connection error:", error);
	if (error.name === "MongoNetworkError") {
		throw new ApiError(503, "Database connection failed");
	}
	if (error.name === "MongoTimeoutError") {
		throw new ApiError(408, "Database operation timeout");
	}
	throw new ApiError(500, "Database error occurred");
};

/**
 * Safe async operation wrapper
 */
export const safeAsyncOperation = async (
	operation,
	fallback = null,
	throwOnError = true,
) => {
	try {
		return await operation();
	} catch (error) {
		console.error("Safe async operation failed:", error);
		if (throwOnError) {
			throw error;
		}
		return fallback;
	}
};

/**
 * Controller error handler
 */
export const handleControllerError = (error, req, res, startTime, logger) => {
	const executionTime = Date.now() - startTime;
	logger?.error("Controller error:", {
		error: error.message,
		stack: error.stack,
		url: req.originalUrl,
		method: req.method,
		executionTime,
	});
	if (error instanceof ApiError) {
		return res
			.status(error.statusCode)
			.json(new ApiResponse(error.statusCode, error.data, error.message, false));
	}
	return res
		.status(500)
		.json(new ApiResponse(500, null, "Internal server error", false));
};
