// server.js
import http from "http";
import os from "os";
import app from "./app.js";
import { serverConfig } from "./config/index.js";
import { logger } from "./shared/services/logger.service.js";
import connectDB, { disconnectDB } from "./config/database/connection.js";

// --------------------
// Helper: Get system IP (secure for production)
// --------------------
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

// --------------------
// Production-grade port handling
// --------------------
const handlePortConflict = (port, error) => {
  if (serverConfig.nodeEnv === "production") {
    // Production: Fixed port, let PM2/systemd handle restart
    logger.error("Port conflict in production - PM2 will handle restart", {
      port,
      error: error.code,
      pid: process.pid,
      recommendation: "Check PM2 logs and restart policy",
    });
    process.exit(1); // Let PM2 restart
  } else {
    // Development: Try next port for convenience
    return findAvailablePort(port + 1);
  }
};

const findAvailablePort = startPort => {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(startPort, err => {
      if (err?.code === "EADDRINUSE") {
        server.close();
        const nextPort = handlePortConflict(startPort, err);
        if (nextPort) {
          nextPort.then(resolve).catch(reject);
        }
      } else if (err) {
        reject(err);
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
    logger.info("Database connection established", { database: "MongoDB" });

    // Production: Use fixed port, Development: Find available
    const port = serverConfig.nodeEnv === "production"
			? serverConfig.port
			: await findAvailablePort(serverConfig.port);
    const server = http.createServer(app);
    const { ip, hostname } = getSystemInfo();

    // Start server
    server.listen(port, process.env.HOST || "0.0.0.0", () => {
      if (serverConfig.nodeEnv === "development") {
        // Development: Show detailed info
        logger.info("✅ MongoDB Connected Successfully");
        logger.info("⚙️ Server is running at:");
        logger.info(`🔹 Local:   http://localhost:${port}`);
        logger.info(`🔹 Network: http://${ip}:${port}`);
        logger.info(`🔹 API:     http://${ip}:${port}/api/${serverConfig.apiVersion}`);
        logger.info(`🔹 Environment: ${serverConfig.nodeEnv}`);
        logger.info(`🔹 Process ID: ${process.pid}`);
      } else {
        // Production: Secure logging
        logger.info("Server started successfully", {
          port,
          environment: serverConfig.nodeEnv,
          hostname,
          pid: process.pid,
          version: serverConfig.apiVersion,
        });
      }

      if (port !== serverConfig.port && serverConfig.nodeEnv === "development") {
        logger.warn("Development port conflict resolved", {
          requested: serverConfig.port,
          used: port,
          note: "Use 'netstat -ano | findstr :5000' to check port usage",
        });
      }
    });

    // --------------------
    // Server Error Handling
    // --------------------
    server.on("error", err => {
      if (err.code === "EADDRINUSE") {
        logger.error("Port already in use", {
          port: err.port || port,
          environment: serverConfig.nodeEnv,
          pid: process.pid,
          action: serverConfig.nodeEnv === "production"
						? "PM2 will restart with different strategy"
						: `Check running processes: netstat -ano | findstr :${  port}`,
        });
      } else {
        logger.error("Server error occurred", {
          error: err.message,
          code: err.code,
          port: err.port || port,
        });
      }
      process.exit(1);
    });

    // --------------------
    // Graceful Shutdown Function
    // --------------------
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
      logger.error("Uncaught exception detected", {
        error: err.message,
        stack: err.stack,
        pid: process.pid,
      });
      await gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", async (reason, promise) => {
      logger.error("Unhandled promise rejection", {
        reason: reason?.message || reason,
        stack: reason?.stack,
        pid: process.pid,
      });
      await gracefulShutdown("unhandledRejection");
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

// --------------------
// Initialize server
// --------------------
startServer();
