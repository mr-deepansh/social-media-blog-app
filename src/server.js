// server.js
import http from "http";
import https from "https"; // ✅ Added for HTTPS
import fs from "fs"; // ✅ For reading cert and key
import os from "os";
import app from "./app.js";
import { serverConfig } from "./config/index.js";
import { logger } from "./shared/services/logger.service.js";
import connectDB, { disconnectDB } from "./config/database/connection.js";
import { validateSecurityConfig } from "./shared/config/security.config.js";
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

// ==============================================
// Kill Port in Development to avoid conflicts
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
// Start Server
// ===============================
const startServer = async () => {
  try {
    // 🔒 Validate security configuration
    validateSecurityConfig();

    // 🔹 Kill port in development only
    if (serverConfig.nodeEnv === "development" || process.env.NODE_ENV === "development") {
      await killPort(serverConfig.port);
    } else if (serverConfig.nodeEnv === "production") {
      // Skip port conflict check in production for PM2 managed processes
      logger.info("Production mode - PM2 managed process", { pid: process.pid });
    }
    // ✅ Connect MongoDB
    await connectDB();
    if (serverConfig.nodeEnv === "development") {
      // Development logging handled in server startup
    } else {
      logger.info("Database connection established", { database: "MongoDB" });
    }
    // Always use the same port - development kills existing, production fails
    const port = serverConfig.port;
    const { ip, hostname } = getSystemInfo();
    // ======================================
    // ✅ HTTPS Setup (only for development)
    // Start server with retry logic for development
    // ======================================
    let server;
    if (serverConfig.httpsEnabled) {
      // Check if SSL certificates exist
      const keyPath = "D:/Backend/ssl/key.pem";
      const certPath = "D:/Backend/ssl/cert.pem";
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const sslOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        server = https.createServer(sslOptions, app);
        console.log("🔒 HTTPS server enabled");
      } else {
        console.log("⚠️ SSL certificates not found, using HTTP");
        server = http.createServer(app);
      }
    } else {
      server = http.createServer(app);
    }
    // ======================================
    // Retry Logic for Server Start
    // ======================================
    const startServerWithRetry = async (retries = 3) => {
      try {
        await new Promise((resolve, reject) => {
          const onError = err => {
            server.removeListener("error", onError);
            reject(err);
          };
          server.once("error", onError);
          server.listen(port, process.env.HOST || "0.0.0.0", () => {
            server.removeListener("error", onError);
            resolve();
          });
        });
        // Success - show startup info
        const protocol = serverConfig.httpsEnabled ? "https" : "http";
        const startupInfo = {
          port,
          ip,
          hostname,
          protocol,
          environment: serverConfig.nodeEnv,
          pid: process.pid,
          version: serverConfig.apiVersion,
          timestamp: new Date().toISOString(),
          urls: {
            local: `${protocol}://localhost:${port}`,
            network: `${protocol}://${ip}:${port}`,
            api: `${protocol}://${ip}:${port}/api/${serverConfig.apiVersion}`,
            health: `${protocol}://${ip}:${port}/health`,
          },
        };

        if (serverConfig.nodeEnv === "development") {
          console.log("✅ MongoDB Connected Successfully");
          console.log("⚙️ Server is running at:");
          console.log(`🔹 Local:   ${startupInfo.urls.local}`);
          console.log(`🔹 Network: ${startupInfo.urls.network}`);
          console.log(`🔹 API:     ${startupInfo.urls.api}`);
          console.log(`🔹 Health:  ${startupInfo.urls.health}`);
          console.log(`🔹 Environment: ${serverConfig.nodeEnv}`);
          console.log(`🔹 Process ID: ${process.pid}`);
          console.log(`🔹 Hostname: ${hostname}`);
        } else {
          // Production logging with all details
          logger.info("🚀 SERVER STARTED SUCCESSFULLY", startupInfo);
          logger.info("📍 SERVICE ENDPOINTS", {
            local: startupInfo.urls.local,
            network: startupInfo.urls.network,
            api: startupInfo.urls.api,
            health: startupInfo.urls.health,
          });
          logger.info("💻 SYSTEM INFO", {
            hostname,
            ip,
            port,
            protocol,
            pid: process.pid,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
          });
        }
      } catch (err) {
        if (err.code === "EADDRINUSE") {
          if (serverConfig.nodeEnv === "development" && retries > 0) {
            console.log(`🔄 Port ${port} in use, retrying... (${retries} left)`);
            await killPort(port);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return startServerWithRetry(retries - 1);
          } else if (serverConfig.nodeEnv === "production") {
            logger.error("Port already in use in production", {
              port,
              pid: process.pid,
              error: err.message,
              suggestion: "Check for existing processes or use PM2 reload instead of restart",
            });
            process.exit(1);
          }
        }
        throw err;
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
          logger.info("HTTP/HTTPS server closed");
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
    // ✅ Unified error handling for both modes
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
