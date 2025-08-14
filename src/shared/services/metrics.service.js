// src/shared/services/metrics.service.js
import { Logger } from "../utils/Logger.js";
/**
 * MetricsCollector - Comprehensive metrics collection service
 * Handles counters, timers, histograms, and custom metrics
 */
export class MetricsCollector {
	constructor(options = {}) {
		this.logger = new Logger("MetricsCollector");
		this.metrics = new Map();
		this.timers = new Map();
		this.histograms = new Map();

		// Configuration
		this.config = {
			flushInterval: options.flushInterval || 60000, // 1 minute
			maxMetricsInMemory: options.maxMetricsInMemory || 10000,
			enableConsoleOutput: options.enableConsoleOutput ?? true,
			enableFileOutput: options.enableFileOutput ?? false,
			enableRemoteOutput: options.enableRemoteOutput ?? false,
			remoteEndpoint: options.remoteEndpoint || null,
			namespace: options.namespace || "app",
			environment: options.environment || "development",
			...options,
		};

		// Initialize storage
		this.counters = new Map();
		this.gauges = new Map();
		this.timingMetrics = new Map();
		this.customMetrics = new Map();

		// Start periodic flush if enabled
		if (this.config.flushInterval > 0) {
			this.startPeriodicFlush();
		}

		this.logger.info("MetricsCollector initialized", {
			flushInterval: this.config.flushInterval,
			namespace: this.config.namespace,
			environment: this.config.environment,
		});
	}

	/**
	 * Increment a counter metric
	 * @param {string} name - Metric name
	 * @param {number} value - Value to increment by (default: 1)
	 * @param {Object} tags - Additional tags/labels
	 */
	increment(name, value = 1, tags = {}) {
		try {
			const metricKey = this.buildMetricKey(name, tags);
			const currentValue = this.counters.get(metricKey) || 0;
			this.counters.set(metricKey, currentValue + value);

			// Store metadata
			this.storeMetricMetadata(name, "counter", tags, { value });

			// Debug logging removed for production performance
		} catch (error) {
			this.logger.error("Failed to increment counter", {
				name,
				value,
				tags,
				error: error.message,
			});
		}
	}

	/**
	 * Decrement a counter metric
	 * @param {string} name - Metric name
	 * @param {number} value - Value to decrement by (default: 1)
	 * @param {Object} tags - Additional tags/labels
	 */
	decrement(name, value = 1, tags = {}) {
		this.increment(name, -value, tags);
	}

	/**
	 * Set a gauge metric (current value)
	 * @param {string} name - Metric name
	 * @param {number} value - Current value
	 * @param {Object} tags - Additional tags/labels
	 */
	gauge(name, value, tags = {}) {
		try {
			const metricKey = this.buildMetricKey(name, tags);
			this.gauges.set(metricKey, {
				value,
				timestamp: Date.now(),
				tags: { ...tags },
			});

			this.storeMetricMetadata(name, "gauge", tags, { value });

			// Debug logging removed for production performance
		} catch (error) {
			this.logger.error("Failed to set gauge", {
				name,
				value,
				tags,
				error: error.message,
			});
		}
	}

	/**
	 * Record timing metric
	 * @param {string} name - Metric name
	 * @param {number} duration - Duration in milliseconds
	 * @param {Object} tags - Additional tags/labels
	 */
	timing(name, duration, tags = {}) {
		try {
			const metricKey = this.buildMetricKey(name, tags);

			if (!this.timingMetrics.has(metricKey)) {
				this.timingMetrics.set(metricKey, []);
			}

			const timings = this.timingMetrics.get(metricKey);
			timings.push({
				duration,
				timestamp: Date.now(),
			});

			// Keep only recent timings to prevent memory issues
			if (timings.length > 1000) {
				timings.splice(0, timings.length - 1000);
			}

			this.storeMetricMetadata(name, "timing", tags, { duration });

			// Debug logging removed for production performance
		} catch (error) {
			this.logger.error("Failed to record timing", {
				name,
				duration,
				tags,
				error: error.message,
			});
		}
	}

	/**
	 * Start a timer for a metric
	 * @param {string} name - Metric name
	 * @param {Object} tags - Additional tags/labels
	 * @returns {Function} - Function to call when timer should stop
	 */
	startTimer(name, tags = {}) {
		const startTime = process.hrtime.bigint();
		const timerKey = `${name}_${Date.now()}_${Math.random()}`;

		this.timers.set(timerKey, {
			name,
			tags,
			startTime,
		});

		// Return a function to stop the timer
		return () => {
			const timer = this.timers.get(timerKey);
			if (timer) {
				const endTime = process.hrtime.bigint();
				const duration = Number(endTime - timer.startTime) / 1000000; // Convert to milliseconds

				this.timing(timer.name, duration, timer.tags);
				this.timers.delete(timerKey);

				return duration;
			}
			return null;
		};
	}

	/**
	 * Record histogram value
	 * @param {string} name - Metric name
	 * @param {number} value - Value to record
	 * @param {Object} tags - Additional tags/labels
	 */
	histogram(name, value, tags = {}) {
		try {
			const metricKey = this.buildMetricKey(name, tags);

			if (!this.histograms.has(metricKey)) {
				this.histograms.set(metricKey, []);
			}

			const values = this.histograms.get(metricKey);
			values.push({
				value,
				timestamp: Date.now(),
			});

			// Keep only recent values
			if (values.length > 1000) {
				values.splice(0, values.length - 1000);
			}

			this.storeMetricMetadata(name, "histogram", tags, { value });

			// Debug logging removed for production performance
		} catch (error) {
			this.logger.error("Failed to record histogram", {
				name,
				value,
				tags,
				error: error.message,
			});
		}
	}

	/**
	 * Record custom metric
	 * @param {string} name - Metric name
	 * @param {any} value - Metric value
	 * @param {string} type - Metric type
	 * @param {Object} tags - Additional tags/labels
	 */
	custom(name, value, type = "custom", tags = {}) {
		try {
			const metricKey = this.buildMetricKey(name, tags);

			this.customMetrics.set(metricKey, {
				name,
				value,
				type,
				tags: { ...tags },
				timestamp: Date.now(),
			});

			this.storeMetricMetadata(name, type, tags, { value });

			// Debug logging removed for production performance
		} catch (error) {
			this.logger.error("Failed to record custom metric", {
				name,
				value,
				type,
				tags,
				error: error.message,
			});
		}
	}

	/**
	 * Get current metric value
	 * @param {string} name - Metric name
	 * @param {Object} tags - Tags to match
	 * @returns {any} - Current metric value
	 */
	getMetric(name, tags = {}) {
		const metricKey = this.buildMetricKey(name, tags);

		// Check different metric types
		if (this.counters.has(metricKey)) {
			return this.counters.get(metricKey);
		}

		if (this.gauges.has(metricKey)) {
			return this.gauges.get(metricKey).value;
		}

		if (this.customMetrics.has(metricKey)) {
			return this.customMetrics.get(metricKey).value;
		}

		return null;
	}

	/**
	 * Get timing statistics
	 * @param {string} name - Metric name
	 * @param {Object} tags - Tags to match
	 * @returns {Object} - Timing statistics
	 */
	getTimingStats(name, tags = {}) {
		const metricKey = this.buildMetricKey(name, tags);
		const timings = this.timingMetrics.get(metricKey);

		if (!timings || timings.length === 0) {
			return null;
		}

		const durations = timings.map((t) => t.duration);
		durations.sort((a, b) => a - b);

		return {
			count: durations.length,
			min: Math.min(...durations),
			max: Math.max(...durations),
			avg: durations.reduce((a, b) => a + b, 0) / durations.length,
			median: this.calculatePercentile(durations, 50),
			p95: this.calculatePercentile(durations, 95),
			p99: this.calculatePercentile(durations, 99),
		};
	}

	/**
	 * Get all metrics summary
	 * @returns {Object} - Complete metrics summary
	 */
	getAllMetrics() {
		return {
			counters: Object.fromEntries(this.counters),
			gauges: Object.fromEntries(
				Array.from(this.gauges.entries()).map(([key, data]) => [
					key,
					data.value,
				]),
			),
			timings: Object.fromEntries(
				Array.from(this.timingMetrics.entries()).map(([key, timings]) => [
					key,
					this.getTimingStats(key.split("|")[0], this.parseTagsFromKey(key)),
				]),
			),
			custom: Object.fromEntries(
				Array.from(this.customMetrics.entries()).map(([key, data]) => [
					key,
					data.value,
				]),
			),
			metadata: {
				totalMetrics:
					this.counters.size +
					this.gauges.size +
					this.timingMetrics.size +
					this.customMetrics.size,
				generatedAt: new Date().toISOString(),
				namespace: this.config.namespace,
				environment: this.config.environment,
			},
		};
	}

	/**
	 * Reset all metrics
	 */
	reset() {
		this.counters.clear();
		this.gauges.clear();
		this.timingMetrics.clear();
		this.histograms.clear();
		this.customMetrics.clear();
		this.metrics.clear();

		this.logger.info("All metrics reset");
	}

	/**
	 * Reset specific metric
	 * @param {string} name - Metric name to reset
	 */
	resetMetric(name) {
		const keysToDelete = [];

		// Find all keys that match the metric name
		for (const [key] of [
			...this.counters,
			...this.gauges,
			...this.timingMetrics,
			...this.customMetrics,
		]) {
			if (key.startsWith(name + "|") || key === name) {
				keysToDelete.push(key);
			}
		}

		// Delete matching keys from all metric stores
		keysToDelete.forEach((key) => {
			this.counters.delete(key);
			this.gauges.delete(key);
			this.timingMetrics.delete(key);
			this.customMetrics.delete(key);
		});

		this.logger.info("Metric reset", {
			name,
			keysDeleted: keysToDelete.length,
		});
	}

	/**
	 * Flush metrics to configured outputs
	 */
	async flush() {
		try {
			const metrics = this.getAllMetrics();

			if (this.config.enableConsoleOutput) {
				this.outputToConsole(metrics);
			}

			if (this.config.enableFileOutput) {
				await this.outputToFile(metrics);
			}

			if (this.config.enableRemoteOutput && this.config.remoteEndpoint) {
				await this.outputToRemote(metrics);
			}

			// Debug logging removed for production performance
		} catch (error) {
			this.logger.error("Failed to flush metrics", { error: error.message });
		}
	}

	// Private methods

	buildMetricKey(name, tags) {
		if (Object.keys(tags).length === 0) {
			return name;
		}

		const tagString = Object.entries(tags)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, value]) => `${key}=${value}`)
			.join(",");

		return `${name}|${tagString}`;
	}

	parseTagsFromKey(key) {
		const parts = key.split("|");
		if (parts.length < 2) return {};

		const tagString = parts[1];
		const tags = {};

		tagString.split(",").forEach((pair) => {
			const [key, value] = pair.split("=");
			if (key && value) {
				tags[key] = value;
			}
		});

		return tags;
	}

	storeMetricMetadata(name, type, tags, data) {
		const metricKey = this.buildMetricKey(name, tags);
		this.metrics.set(metricKey, {
			name,
			type,
			tags: { ...tags },
			lastUpdated: Date.now(),
			...data,
		});
	}

	calculatePercentile(sortedArray, percentile) {
		const index = (percentile / 100) * (sortedArray.length - 1);
		const lower = Math.floor(index);
		const upper = Math.ceil(index);
		const weight = index - lower;

		if (lower === upper) {
			return sortedArray[lower];
		}

		return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
	}

	startPeriodicFlush() {
		this.flushInterval = setInterval(() => {
			this.flush();
		}, this.config.flushInterval);

		this.logger.info("Periodic flush started", {
			interval: this.config.flushInterval,
		});
	}

	stopPeriodicFlush() {
		if (this.flushInterval) {
			clearInterval(this.flushInterval);
			this.flushInterval = null;
			this.logger.info("Periodic flush stopped");
		}
	}

	outputToConsole(metrics) {
		console.log("\n=== METRICS REPORT ===");
		console.log(`Generated at: ${metrics.metadata.generatedAt}`);
		console.log(`Total metrics: ${metrics.metadata.totalMetrics}`);
		console.log(`Namespace: ${metrics.metadata.namespace}`);
		console.log(`Environment: ${metrics.metadata.environment}\n`);

		if (Object.keys(metrics.counters).length > 0) {
			console.log("COUNTERS:");
			Object.entries(metrics.counters).forEach(([key, value]) => {
				console.log(`  ${key}: ${value}`);
			});
			console.log("");
		}

		if (Object.keys(metrics.gauges).length > 0) {
			console.log("GAUGES:");
			Object.entries(metrics.gauges).forEach(([key, value]) => {
				console.log(`  ${key}: ${value}`);
			});
			console.log("");
		}

		if (Object.keys(metrics.timings).filter(([, stats]) => stats).length > 0) {
			console.log("TIMINGS:");
			Object.entries(metrics.timings).forEach(([key, stats]) => {
				if (stats) {
					console.log(`  ${key}:`);
					console.log(`    Count: ${stats.count}`);
					console.log(`    Avg: ${stats.avg.toFixed(2)}ms`);
					console.log(`    Min: ${stats.min.toFixed(2)}ms`);
					console.log(`    Max: ${stats.max.toFixed(2)}ms`);
					console.log(`    P95: ${stats.p95.toFixed(2)}ms`);
				}
			});
			console.log("");
		}

		console.log("========================\n");
	}

	async outputToFile(metrics) {
		// Implementation would depend on your file system setup
		// This is a placeholder for file output functionality
		this.logger.info("File output not implemented yet");
	}

	async outputToRemote(metrics) {
		// Implementation would depend on your remote metrics system
		// This is a placeholder for remote output functionality
		this.logger.info("Remote output not implemented yet");
	}

	/**
	 * Cleanup method to call before shutting down
	 */
	async shutdown() {
		this.stopPeriodicFlush();
		await this.flush();
		this.reset();
		this.logger.info("MetricsCollector shutdown complete");
	}
}

export default MetricsCollector;
