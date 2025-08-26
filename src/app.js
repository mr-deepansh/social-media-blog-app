// src/app.js
// Core imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Custom middlewares
import { apiRateLimiter } from "./shared/middleware/rateLimit.middleware.js";

// Configurations
import { serverConfig, securityConfig } from "./config/index.js";

// Shared utilities
import { ApiError } from "./shared/index.js";

// Route imports
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import forgotPasswordRoutes from "./modules/auth/routes/forgotPassword.routes.js";
import resetPasswordRoutes from "./modules/auth/routes/resetPassword.routes.js";
import userRoutes from "./modules/users/routes/user.routes.js";
import blogRoutes from "./modules/blogs/routes/blog.routes.js";

// Initialize Express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Apply security headers
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'"],
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
		crossOriginEmbedderPolicy: false,
	}),
);
// Body parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Debug middleware - log all requests
app.use((req, res, next) => {
	console.log(`\n📥 ${req.method} ${req.originalUrl}`);
	console.log(`🌐 Origin:`, req.headers.origin);
	console.log(`📝 Query:`, req.query);
	console.log(`📦 Body:`, req.body);
	console.log(`🔑 Headers:`, {
		"content-type": req.headers["content-type"],
		authorization: req.headers.authorization ? "Present" : "Missing",
	});
	next();
});

// Apply global rate limiter
app.use(apiRateLimiter);

// Global middlewares - CORS configuration
const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		// Allow localhost and common development origins
		const allowedOrigins = [
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3001",
			"http://localhost:5173", // Vite default
			"http://localhost:5174",
			origin, // Allow the requesting origin
		];

		console.log("🌐 CORS Origin:", origin);
		callback(null, true); // Allow all origins for now
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("combined"));

// Static files
app.use("/Public", express.static(path.join(__dirname, "../Public")));
app.use(
	"/favicon.ico",
	express.static(path.join(__dirname, "../Public/favicon.ico")),
);

// Health check routes
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		version: serverConfig.apiVersion,
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

app.get(`/api/${serverConfig.apiVersion}`, (req, res) => {
	res.status(200).json({
		success: true,
		message: `API version ${serverConfig.apiVersion} is running successfully`,
		timestamp: new Date().toISOString(),
	});
});

// API Routes
const apiRouter = express.Router();

apiRouter.use("/admin", adminRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/auth", forgotPasswordRoutes);
apiRouter.use("/auth", resetPasswordRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/blogs", blogRoutes);

// 404 handler
apiRouter.use("*", (req, res) => {
	throw new ApiError(404, "API Route Not Found, check the URL and try again.");
});

app.use(`/api/${serverConfig.apiVersion}`, apiRouter);

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Route Not Found",
		path: req.originalUrl,
		method: req.method,
		timestamp: new Date().toISOString(),
	});
});

// Global error handler
import { globalErrorHandler, notFound } from "./shared/utils/ErrorHandler.js";
app.use(notFound);
app.use(globalErrorHandler);

// Graceful shutdown handlers
process.on("SIGTERM", () => {
	console.log("SIGTERM received. Shutting down gracefully...");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("SIGINT received. Shutting down gracefully...");
	process.exit(0);
});

process.on("unhandledRejection", (err) => {
	console.error("Unhandled Rejection:", err);
	process.exit(1);
});

export default app;
