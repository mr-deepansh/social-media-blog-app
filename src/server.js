// server.js
import http from "http";
import os from "os";
import app from "./app.js";
import { serverConfig } from "./config/index.js";
import morgan from "morgan";
import connectDB, { disconnectDB } from "./config/database/connection.js";

// --------------------
// Helper: Get local LAN IP
// --------------------
const getLocalIp = () => {
	const nets = os.networkInterfaces();
	for (const name in nets) {
		for (const net of nets[name]) {
			if (net.family === "IPv4" && !net.internal) {
				return net.address;
			}
		}
	}
	return "localhost";
};

// --------------------
// Helper: Find an available port
// --------------------
const findAvailablePort = startPort => {
	return new Promise((resolve, reject) => {
		const server = http.createServer();
		server.listen(startPort, err => {
			if (err) {
				if (err.code === "EADDRINUSE") {
					// Port is in use, try next port
					findAvailablePort(startPort + 1)
						.then(resolve)
						.catch(reject);
				} else {
					reject(err);
				}
			} else {
				server.close(() => resolve(startPort));
			}
		});
	});
};

// --------------------
// Start Server Function
// --------------------
const startServer = async () => {
	try {
		// Connect to MongoDB
		await connectDB();

		// Find an available port
		const availablePort = await findAvailablePort(serverConfig.port);
		const server = http.createServer(app);

		// Start HTTP server
		server.listen(availablePort, "0.0.0.0", () => {
			const localIP = getLocalIp();
			console.log("✅ MongoDB Connected Successfully");
			console.log("⚙️  Server is running at:");
			console.log(`🔹 Local:   http://localhost:${availablePort}`);
			console.log(`🔹 Network: http://${localIP}:${availablePort}`);
			console.log(`🔹 API:     http://localhost:${availablePort}/api/${serverConfig.apiVersion}`);
			console.log(`🔹 Environment: ${serverConfig.nodeEnv}`);
			console.log(`🔹 Process ID: ${process.pid}`);

			if (availablePort !== serverConfig.port) {
				console.log(`ℹ️  Port ${serverConfig.port} was in use, using port ${availablePort}`);
			}
		});

		// --------------------
		// Server Error Handling
		// --------------------
		server.on("error", err => {
			console.error("❌ Server Error:", err.message);
			process.exit(1);
		});

		// --------------------
		// Graceful Shutdown Function
		// --------------------
		const gracefulShutdown = async signal => {
			console.log(`\n🔄 Received ${signal}. Graceful shutdown...`);
			try {
				server.close(async () => {
					console.log("✅ HTTP server closed");

					// Close MongoDB connection
					await disconnectDB();
					console.log("✅ MongoDB disconnected");

					process.exit(0);
				});
			} catch (err) {
				console.error("❌ Shutdown Error:", err);
				process.exit(1);
			}
		};

		// Handle termination signals
		process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
		process.on("SIGINT", () => gracefulShutdown("SIGINT"));

		// Handle uncaught exceptions and unhandled rejections
		process.on("uncaughtException", async err => {
			console.error("❌ Uncaught Exception:", err);
			await gracefulShutdown("uncaughtException");
		});

		process.on("unhandledRejection", async (reason, promise) => {
			console.error("❌ Unhandled Rejection:", reason);
			await gracefulShutdown("unhandledRejection");
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error.message);
		process.exit(1);
	}
};

// --------------------
// Initialize server
// --------------------
startServer();
