// ========================================
// MAIN CONFIGURATION FILE
// ========================================
// Centralized configuration management

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ========================================
// SERVER CONFIGURATION
// ========================================
export const serverConfig = {
	port: process.env.PORT || 5000,
	host: process.env.HOST || "localhost",
	nodeEnv: process.env.NODE_ENV || "development",
	apiVersion: "v1",
	baseUrl:
		process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
};

// ========================================
// DATABASE CONFIGURATION
// ========================================
export const databaseConfig = {
	uri: process.env.MONGODB_URI,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	},
};

// ========================================
// JWT CONFIGURATION
// ========================================
export const jwtConfig = {
	secret: process.env.JWT_SECRET,
	expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
	algorithm: "HS256",
};

// ========================================
// EMAIL CONFIGURATION
// ========================================
export const emailConfig = {
	service: process.env.EMAIL_SERVICE || "gmail",
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT) || 587,
	secure: false,
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},
	from: {
		email: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
		name: process.env.EMAIL_FROM_NAME || "Social Media Blog App",
	},
};

// ========================================
// SECURITY CONFIGURATION
// ========================================
export const securityConfig = {
	cors: {
		origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	},
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
		max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
		message: "Too many requests from this IP, please try again later.",
	},
	passwordReset: {
		tokenExpiry: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) || 15, // minutes
	},
};

// ========================================
// FILE UPLOAD CONFIGURATION
// ========================================
export const uploadConfig = {
	maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
	allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
	],
	uploadDir: process.env.UPLOAD_DIR || "uploads",
};

// ========================================
// LOGGING CONFIGURATION
// ========================================
export const loggingConfig = {
	level: process.env.LOG_LEVEL || "info",
	file: process.env.LOG_FILE || "logs/app.log",
	maxSize: "10m",
	maxFiles: "5d",
};

// ========================================
// CACHE CONFIGURATION (Optional)
// ========================================
export const cacheConfig = {
	redis: {
		url: process.env.REDIS_URL,
		ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
	},
};

// ========================================
// MONITORING CONFIGURATION (Optional)
// ========================================
export const monitoringConfig = {
	sentry: {
		dsn: process.env.SENTRY_DSN,
	},
	analytics: {
		googleTrackingId: process.env.GA_TRACKING_ID,
	},
};

// ========================================
// VALIDATION CONFIGURATION
// ========================================
export const validationConfig = {
	password: {
		minLength: 8,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSpecialChars: false,
	},
	email: {
		maxLength: 254,
	},
	username: {
		minLength: 3,
		maxLength: 30,
		pattern: /^[a-zA-Z0-9_]+$/,
	},
};

// ========================================
// EXPORT ALL CONFIGURATIONS
// ========================================
export default {
	server: serverConfig,
	database: databaseConfig,
	jwt: jwtConfig,
	email: emailConfig,
	security: securityConfig,
	upload: uploadConfig,
	logging: loggingConfig,
	cache: cacheConfig,
	monitoring: monitoringConfig,
	validation: validationConfig,
};
