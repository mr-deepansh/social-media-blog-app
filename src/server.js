// server.js
import http from "http";
import os from "os";
import app from "./app.js";
import { serverConfig } from "./config/index.js";
import { logger } from "./shared/services/logger.service.js";
import connectDB, { disconnectDB } from "./config/database/connection.js";
import { execSync } from "child_process";

// ==============================================
// Helper: Get system IP (secure for production)
// =============================================
const getSystemInfo = () => {
	const isDev = serverConfig.nodeEnv === "development";
	const nets = os.networkInterfaces();
	let localIp = "localhost";

	if (isDev) {
		for (const name in nets) {
			for (const net of nets[name]) {
				if (net.family === "IPv4" && !net.internal) {
					if (!net.address.startsWith("172.") && !net.address.startsWith("192.168.59.")) {
						return { ip: net.address, hostname: os.hostname() };
					}
					localIp = net.address;
				}
			}
		}
	}

	return { ip: localIp, hostname: os.hostname() };
};

// =================================
// Port management: Kill in dev, fail in prod
// =================================

// ==============================================
// Preemptively kill process on port in development
// ==============================================
const killPort = async port => {
	try {
		// Find processes using the port
		const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
		const lines = output.trim().split("\n");

		const pids = new Set();
		for (const line of lines) {
			if (line.includes("LISTENING")) {
				const parts = line.trim().split(/\s+/);
				const pid = parts[parts.length - 1];
				if (pid && !isNaN(pid) && pid !== "0") {
					pids.add(pid);
				}
			}
		}

		// Kill each process
		for (const pid of pids) {
			try {
				execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
				console.log(`🔄 Killed process ${pid} on port ${port}`);
			} catch (killErr) {
				// Process might already be dead
			}
		}

		if (pids.size > 0) {
			// Wait for processes to fully terminate
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	} catch (err) {
		// Port is free or error occurred - this is fine
	}
};

// ===============================
// Start Server Function
// ===============================
const startServer = async () => {
	try {
		// Kill port if in development (always kill to prevent nodemon conflicts)
		if (serverConfig.nodeEnv === "development" || process.env.NODE_ENV === "development") {
			await killPort(serverConfig.port);
		} else if (serverConfig.nodeEnv === "production") {
			// In production, check if port is in use and fail fast
			try {
				const output = execSync(`netstat -ano | findstr :${serverConfig.port}`, { encoding: "utf8" });
				if (output.includes("LISTENING")) {
					logger.error("Port conflict in production", {
						port: serverConfig.port,
						pid: process.pid,
						recommendation: "Use PM2 or check for existing processes",
					});
					process.exit(1);
				}
			} catch (err) {
				// Port is free, continue
			}
		}
		// Connect to MongoDB
		await connectDB();
		if (serverConfig.nodeEnv === "development") {
			// Development logging handled in server startup
		} else {
			logger.info("Database connection established", { database: "MongoDB" });
		}

		// Always use the same port - development kills existing, production fails
		const port = serverConfig.port;
		const server = http.createServer(app);
		const { ip, hostname } = getSystemInfo();

		// Start server with retry logic for development
		const startServerWithRetry = async (retries = 3) => {
			try {
				await new Promise((resolve, reject) => {
					server.listen(port, process.env.HOST, resolve);
					server.on("error", reject);
				});

				// Success - show startup info
				if (serverConfig.nodeEnv === "development") {
					console.log("✅ MongoDB Connected Successfully");
					console.log("⚙️ Server is running at:");
					console.log(`🔹 Local:   http://localhost:${port}`);
					console.log(`🔹 Network: http://${ip}:${port}`);
					console.log(`🔹 API:     http://${ip}:${port}/api/${serverConfig.apiVersion}`);
					console.log(`🔹 Environment: ${serverConfig.nodeEnv}`);
					console.log(`🔹 Process ID: ${process.pid}`);
				} else {
					logger.info("Server started successfully", {
						port,
						environment: serverConfig.nodeEnv,
						hostname,
						pid: process.pid,
						version: serverConfig.apiVersion,
					});
				}
			} catch (err) {
				if (err.code === "EADDRINUSE" && serverConfig.nodeEnv === "development" && retries > 0) {
					console.log(`🔄 Port ${port} still in use, retrying... (${retries} attempts left)`);
					await killPort(port);
					await new Promise(resolve => setTimeout(resolve, 1000));
					return startServerWithRetry(retries - 1);
				} else {
					throw err;
				}
			}
		};

		await startServerWithRetry();
		// =====================================
		// Graceful Shutdown Function
		// =====================================
		const gracefulShutdown = async signal => {
			logger.info("Initiating graceful shutdown", { signal, pid: process.pid });

			const shutdownTimeout = setTimeout(() => {
				logger.error("Forced shutdown due to timeout");
				process.exit(1);
			}, 15000); // Reduced to 15s for PM2 compatibility

			try {
				// Stop accepting new connections
				server.close(async () => {
					logger.info("HTTP server closed");

					// Cleanup connections to prevent duplicates
					try {
						// Close Redis connections
						if (global.redisClients) {
							for (const [name, client] of global.redisClients) {
								await client.quit();
								logger.debug(`Redis client ${name} disconnected`);
							}
						}

						// Close MongoDB connections
						await disconnectDB();
						logger.info("All database connections closed");
					} catch (dbErr) {
						logger.error("Error closing connections", { error: dbErr.message });
					}

					clearTimeout(shutdownTimeout);
					logger.info("Graceful shutdown completed");
					process.exit(0);
				});
			} catch (err) {
				logger.error("Shutdown error", { error: err.message, stack: err.stack });
				clearTimeout(shutdownTimeout);
				process.exit(1);
			}
		};

		// Handle termination signals
		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));

		// Handle uncaught exceptions and unhandled rejections
		process.on("uncaughtException", async err => {
			if (serverConfig.nodeEnv === "development") {
				console.log(`❌ Uncaught Exception: ${err.message}`);
				console.log(err.stack);
				// Don't exit in development, let nodemon handle restart
			} else {
				logger.error("Uncaught exception detected", {
					error: err.message,
					stack: err.stack,
					pid: process.pid,
				});
				await gracefulShutdown("uncaughtException");
			}
		});

		process.on("unhandledRejection", async (reason, promise) => {
			if (serverConfig.nodeEnv === "development") {
				console.log(`❌ Unhandled Rejection: ${reason?.message || reason}`);
				if (reason?.stack) {
					console.log(reason.stack);
				}
				// Don't exit in development, let nodemon handle restart
			} else {
				logger.error("Unhandled promise rejection", {
					reason: reason?.message || reason,
					stack: reason?.stack,
					pid: process.pid,
				});
				await gracefulShutdown("unhandledRejection");
			}
		});
	} catch (error) {
		logger.error("Server startup failed", {
			error: error.message,
			stack: error.stack,
			pid: process.pid,
		});
		process.exit(1);
	}
};

// ===========================
// Initialize server
// ===========================
startServer();
