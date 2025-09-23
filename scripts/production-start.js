#!/usr/bin/env node
// scripts/production-start.js
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const checkPort = async (port) => {
  try {
    // Windows command to check port
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    return stdout.trim().length > 0;
  } catch {
    return false; // Port is free
  }
};

const killProcessOnPort = async (port) => {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    const lines = stdout.trim().split("\n");

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];

      if (pid && !isNaN(pid)) {
        console.log(`🔄 Killing process ${pid} on port ${port}`);
        await execAsync(`taskkill /PID ${pid} /F`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not kill process on port ${port}: ${error.message}`);
  }
};

const startProduction = async () => {
  const port = process.env.PORT || 5000;

  console.log("🚀 Starting production server...");

  // Check if port is in use
  const portInUse = await checkPort(port);

  if (portInUse) {
    console.log(`⚠️  Port ${port} is in use`);

    if (process.env.FORCE_KILL === "true") {
      console.log("🔄 Force killing existing processes...");
      await killProcessOnPort(port);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    } else {
      console.log("❌ Port conflict detected. Options:");
      console.log("   1. Set FORCE_KILL=true to kill existing processes");
      console.log("   2. Use different PORT in environment");
      console.log("   3. Stop existing processes manually");
      process.exit(1);
    }
  }

  // Start with PM2
  try {
    console.log("📦 Starting with PM2...");
    await execAsync("pm2 start ecosystem.config.cjs --env production");
    console.log("✅ Production server started successfully");

    // Show status
    const { stdout } = await execAsync("pm2 status");
    console.log("\n📊 PM2 Status:");
    console.log(stdout);

  } catch (error) {
    console.error("❌ Failed to start production server:", error.message);
    process.exit(1);
  }
};

// Handle CLI arguments
if (process.argv.includes("--force")) {
  process.env.FORCE_KILL = "true";
}

startProduction().catch(console.error);
