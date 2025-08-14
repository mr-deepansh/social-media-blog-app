// src/shared/utils/Logger.js
export class Logger {
	constructor(context) {
		this.context = context;
	}

	info(message, data = {}) {
		console.log(`[${this.context}] INFO: ${message}`, data);
	}

	warn(message, data = {}) {
		console.warn(`[${this.context}] WARN: ${message}`, data);
	}

	error(message, data = {}) {
		console.error(`[${this.context}] ERROR: ${message}`, data);
	}
}
