// src/shared/middleware/cors.middleware.js
import cors from "cors";
import { securityConfig, serverConfig } from "../../config/index.js";

// Create CORS options that work with your config structure
const corsOptions = {
	origin: (origin, callback) => {
		console.log(`🔍 CORS: Checking origin: ${origin || "null"}`);

		// Get CORS_ORIGIN from environment
		const corsOrigin = process.env.CORS_ORIGIN;
		console.log(`📝 CORS_ORIGIN env var: ${corsOrigin || "not set"}`);

		// Allow requests with no origin (Postman, mobile apps, server-to-server)
		if (!origin) {
			console.log("✅ CORS: Allowing request with no origin");
			return callback(null, true);
		}

		// Development: Allow wildcard
		if (corsOrigin === "*" && serverConfig.nodeEnv === "development") {
			console.log("✅ CORS: Development mode - allowing all origins");
			return callback(null, true);
		}

		// Parse allowed origins from environment variable
		const allowedOrigins = corsOrigin
			? corsOrigin.split(",").map((o) => o.trim())
			: [];
		console.log(`📋 CORS: Allowed origins:`, allowedOrigins);

		// Check if origin is allowed
		if (allowedOrigins.includes(origin)) {
			console.log(`✅ CORS: Allowing origin: ${origin}`);
			return callback(null, true);
		}

		// Block unauthorized origins
		console.warn(`❌ CORS: Blocked origin: ${origin}`);
		console.warn(`📝 CORS: Allowed origins: ${allowedOrigins.join(", ")}`);
		return callback(
			new Error(`CORS: Origin ${origin} is not allowed by policy`),
			false,
		);
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
		"Cache-Control",
		"X-File-Name",
	],
	exposedHeaders: ["Content-Range", "X-Content-Range"],
	preflightContinue: false,
	optionsSuccessStatus: 204,
};

export default cors(corsOptions);
