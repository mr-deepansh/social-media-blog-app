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
		this.streams = {}; // cache write streams
		this.ensureLogDirectory();

		// Clean up on shutdown
		process.on("exit", () => {
			Object.values(this.streams).forEach(s => s.end());
		});
	}

	ensureLogDirectory() {
		if (!fs.existsSync(this.logDir)) {
			fs.mkdirSync(this.logDir, { recursive: true });
		}
	}

	getLogFile(level) {
		const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		return path.join(this.logDir, `${level}-${date}.log`);
	}

	getStream(level) {
		if (!this.streams[level]) {
			this.streams[level] = fs.createWriteStream(this.getLogFile(level), {
				flags: "a",
			});
		}
		return this.streams[level];
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
		try {
			const stream = this.getStream(level);
			stream.write(this.formatMessage(level, message, meta));
		} catch (err) {
			console.error("Failed to write to log file:", err);
		}
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
