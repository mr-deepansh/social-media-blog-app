// src/shared/utils/Logger.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor(module = "App") {
    this.module = module;
    this.logDir = path.join(__dirname, "../../../logs");
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return `${JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      module: this.module,
      message,
      ...meta,
    })}\n`;
  }

  writeToFile(level, message, meta) {
    const logFile = path.join(this.logDir, `${level}.log`);
    const formattedMessage = this.formatMessage(level, message, meta);

    fs.appendFile(logFile, formattedMessage, err => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });
  }

  info(message, meta = {}) {
    const logMessage = `[${this.module}] ${message}`;
    console.log(`ℹ️  ${logMessage}`, meta);

    if (process.env.NODE_ENV === "production") {
      this.writeToFile("info", message, meta);
    }
  }

  error(message, meta = {}) {
    const logMessage = `[${this.module}] ${message}`;
    console.error(`❌ ${logMessage}`, meta);
    this.writeToFile("error", message, meta);
  }

  warn(message, meta = {}) {
    const logMessage = `[${this.module}] ${message}`;
    console.warn(`⚠️  ${logMessage}`, meta);

    if (process.env.NODE_ENV === "production") {
      this.writeToFile("warn", message, meta);
    }
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      const logMessage = `[${this.module}] ${message}`;
      console.debug(`🐛 ${logMessage}`, meta);
    }
  }

  success(message, meta = {}) {
    const logMessage = `[${this.module}] ${message}`;
    console.log(`✅ ${logMessage}`, meta);

    if (process.env.NODE_ENV === "production") {
      this.writeToFile("info", message, { ...meta, type: "success" });
    }
  }
}

export { Logger };
