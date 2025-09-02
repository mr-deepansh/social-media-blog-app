// server.js
import http from "http";
import os from "os";
import app from "./app.js";
import { serverConfig } from "./config/index.js";
import connectDB from "./config/database/connection.js";

// Get local LAN IP (e.g. 192.168.x.x)
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
        server.close(() => {
          resolve(startPort);
        });
      }
    });
  });
};

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Find available port
    const availablePort = await findAvailablePort(serverConfig.port);
    const server = http.createServer(app);

    server.listen(availablePort, "0.0.0.0", () => {
      const localIP = getLocalIp();
      console.log("✅ MongoDB Connected Successfully");
      console.log("⚙️  Server is running at:");
      console.log(`🔹 Local:   http://localhost:${availablePort}`);
      console.log(`🔹 Network: http://${localIP}:${availablePort}`);
      console.log(
				`🔹 API:     http://localhost:${availablePort}/api/${serverConfig.apiVersion}`,
      );
      console.log(`🔹 Environment: ${serverConfig.nodeEnv}`);
      console.log(`🔹 Process ID: ${process.pid}`);

      if (availablePort !== serverConfig.port) {
        console.log(
					`ℹ️  Port ${serverConfig.port} was in use, using port ${availablePort}`,
        );
      }
    });

    // Enhanced error handling
    server.on("error", err => {
      console.error("❌ Server Error:", err.message);
      process.exit(1);
    });

    // Graceful shutdown handling
    const gracefulShutdown = signal => {
      console.log(`\n🔄 Received ${signal}. Graceful shutdown...`);
      server.close(() => {
        console.log("✅ Server closed successfully");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};
startServer();
