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
// Debug middleware - log all requests
app.use(express.json()); // body-parser
app.use((req, res, next) => {
	console.log(`\n📥 Incoming Request: ${req.method} ${req.originalUrl}`);
	console.log(`📝 Query:`, req.query);
	console.log(`📦 Body:`, req.body);
	next();
});

// Apply global rate limiter
app.use(apiRateLimiter);

// Global middlewares
app.use(cors({ origin: "*", credentials: true }));
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

// console.log(`🔗 Routes mounted at: /api/${serverConfig.apiVersion}`);

// Mount the main API router
/* app.use(`/api/${serverConfig.apiVersion}`, apiRouter);
app.use(
	`/api/${serverConfig.apiVersion}/admin`,
	(req, res, next) => {
		console.log(`🛡️ Admin route middleware: ${req.method} ${req.originalUrl}`);
		next();
	},
	adminRoutes,
); */

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
