// src/shared/services/logger.service.js

import winston from "winston";
import path from "path";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
	let log = `${timestamp} [${level}]: ${message}`;

	if (stack) {
		log += `\n${stack}`;
	}

	if (Object.keys(meta).length > 0) {
		log += `\n${JSON.stringify(meta, null, 2)}`;
	}

	return log;
});

// Production logger configuration
const createLogger = (module = "App") => {
	const isDevelopment = process.env.NODE_ENV === "development";

	const transports = [];

	// Console transport
	if (isDevelopment || process.env.LOG_TO_CONSOLE !== "false") {
		transports.push(
			new winston.transports.Console({
				format: isDevelopment ? combine(colorize(), timestamp(), devFormat) : combine(timestamp(), json()),
				level: isDevelopment ? "debug" : "info",
			}),
		);
	}

	// File transports for production
	if (!isDevelopment || process.env.LOG_TO_FILE === "true") {
		// Error log
		transports.push(
			new winston.transports.File({
				filename: path.join(process.env.LOG_FILE_PATH || "./logs", "error.log"),
				level: "error",
				format: combine(timestamp(), errors({ stack: true }), json()),
				maxsize: 50 * 1024 * 1024, // 50MB
				maxFiles: 5,
				tailable: true,
			}),
		);

		// Combined log
		transports.push(
			new winston.transports.File({
				filename: path.join(process.env.LOG_FILE_PATH || "./logs", "combined.log"),
				format: combine(timestamp(), errors({ stack: true }), json()),
				maxsize: 100 * 1024 * 1024, // 100MB
				maxFiles: 10,
				tailable: true,
			}),
		);
	}

	return winston.createLogger({
		level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
		format: combine(timestamp(), errors({ stack: true }), json()),
		defaultMeta: {
			service: module,
			environment: process.env.NODE_ENV,
			version: process.env.npm_package_version,
		},
		transports,
		exitOnError: false,

		// Handle uncaught exceptions and rejections
		exceptionHandlers: [
			new winston.transports.File({
				filename: path.join(process.env.LOG_FILE_PATH || "./logs", "exceptions.log"),
				maxsize: 50 * 1024 * 1024,
				maxFiles: 3,
			}),
		],

		rejectionHandlers: [
			new winston.transports.File({
				filename: path.join(process.env.LOG_FILE_PATH || "./logs", "rejections.log"),
				maxsize: 50 * 1024 * 1024,
				maxFiles: 3,
			}),
		],
	});
};

// Export singleton logger instance
export const logger = createLogger("SocialMediaApp");

// Export logger factory for modules
export { createLogger };

export default logger;
