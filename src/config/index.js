// src/config/index.js
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ========================================
// SERVER CONFIGURATION
// ========================================
export const serverConfig = {
	port: parseInt(process.env.PORT) || 5000,
	host: process.env.HOST || "localhost",
	nodeEnv: process.env.NODE_ENV || "development",
	apiVersion: process.env.API_VERSION || "v2",
	baseUrl:
		process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
	bodyLimit: process.env.BODY_LIMIT || "16kb",
	timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
	keepAliveTimeout: parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 5000,
	shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT) || 15000,
	clustering: process.env.CLUSTERING === "true",
	backlog: parseInt(process.env.BACKLOG) || 511,
};

// ========================================
// DATABASE CONFIGURATION
// ========================================
export const databaseConfig = {
	uri: process.env.MONGODB_URI,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
		serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 5000,
		socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
		bufferMaxEntries: 0,
		retryWrites: true,
		w: "majority",
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
	accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
	refreshTokenSecret:
		process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
	accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
	refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
	issuer: process.env.JWT_ISSUER || "endlessChatt",
	audience: process.env.JWT_AUDIENCE || "endlessChatt-users",
};

// ========================================
// EMAIL CONFIGURATION
// ========================================
export const emailConfig = {
	service: process.env.EMAIL_SERVICE || "gmail",
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT) || 587,
	secure: process.env.EMAIL_SECURE === "true" || false,
	auth: {
		user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
	},
	from: {
		email: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
		name: process.env.EMAIL_FROM_NAME || "endlessChatt",
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
	local: {
		uploadPath: process.env.UPLOAD_PATH || "./uploads",
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
		allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
			"image/jpeg",
			"image/png",
			"image/gif",
		],
	},
	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME,
		apiKey: process.env.CLOUDINARY_API_KEY,
		apiSecret: process.env.CLOUDINARY_API_SECRET,
		folder: process.env.CLOUDINARY_FOLDER || "endlessChatt",
		maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
		allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"video/mp4",
			"video/webm",
			"video/ogg",
		],
	},
};

// ========================================
// LOGGING CONFIGURATION
// ========================================
export const loggingConfig = {
	level:
		process.env.LOG_LEVEL ||
		(serverConfig.nodeEnv === "production" ? "info" : "debug"),
	file: {
		enabled: process.env.LOG_TO_FILE === "true",
		path: process.env.LOG_FILE_PATH || "./logs",
		filename: process.env.LOG_FILE || "app.log",
		maxSize: process.env.LOG_MAX_SIZE || "10m",
		maxFiles: process.env.LOG_MAX_FILES || "5d",
	},
	console: {
		enabled: process.env.LOG_TO_CONSOLE !== "false",
		colorize: serverConfig.nodeEnv !== "production",
	},
};

// ========================================
// CACHE CONFIGURATION (Optional)
// ========================================
export const cacheConfig = {
	redis: {
		url: process.env.REDIS_URL,
		host: process.env.REDIS_HOST || "localhost",
		port: parseInt(process.env.REDIS_PORT) || 6379,
		password: process.env.REDIS_PASSWORD,
		db: parseInt(process.env.REDIS_DB) || 0,
		keyPrefix: process.env.REDIS_KEY_PREFIX || "endlessChatt:",
		ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
	},
};

// ========================================
// MONITORING CONFIGURATION (Optional)
// ========================================
export const monitoringConfig = {
	sentry: {
		dsn: process.env.SENTRY_DSN,
		environment: serverConfig.nodeEnv,
		tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
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
		minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
		requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== "false",
		requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== "false",
		requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== "false",
		requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === "true",
	},
	email: {
		maxLength: parseInt(process.env.EMAIL_MAX_LENGTH) || 254,
	},
	username: {
		minLength: parseInt(process.env.USERNAME_MIN_LENGTH) || 3,
		maxLength: parseInt(process.env.USERNAME_MAX_LENGTH) || 30,
		pattern: new RegExp(process.env.USERNAME_PATTERN || "^[a-zA-Z0-9_]+$"),
	},
};

// ========================================
// VALIDATION FUNCTION FOR REQUIRED ENV VARS
// ========================================
export const validateConfig = () => {
	const required = ["MONGODB_URI", "JWT_SECRET"];

	const missing = required.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}

	// Validate JWT secret length
	if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
		console.warn(
			"⚠️  JWT_SECRET should be at least 32 characters long for security",
		);
	}
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
	validate: validateConfig,
};
