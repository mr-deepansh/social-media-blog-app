// src/modules/admin/services/monitoring.service.js
import mongoose from "mongoose";
import { CacheService } from "./cache.service.js";

const cache = new CacheService();

class MonitoringService {
	// System Health Monitoring
	async getSystemHealth() {
		const startTime = process.hrtime.bigint();
		
		const health = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: this.getMemoryUsage(),
			cpu: this.getCpuUsage(),
			database: await this.getDatabaseHealth(),
			cache: await this.getCacheHealth(),
			responseTime: 0
		};

		health.responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
		health.status = this.calculateOverallHealth(health);

		return health;
	}

	// Memory Usage
	getMemoryUsage() {
		const usage = process.memoryUsage();
		return {
			used: Math.round(usage.heapUsed / 1024 / 1024),
			total: Math.round(usage.heapTotal / 1024 / 1024),
			external: Math.round(usage.external / 1024 / 1024),
			rss: Math.round(usage.rss / 1024 / 1024),
			percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
		};
	}

	// CPU Usage
	getCpuUsage() {
		const usage = process.cpuUsage();
		return {
			user: usage.user,
			system: usage.system,
			loadAverage: process.platform !== 'win32' ? process.loadavg() : [0, 0, 0]
		};
	}

	// Database Health
	async getDatabaseHealth() {
		try {
			const state = mongoose.connection.readyState;
			const stateMap = {
				0: "disconnected",
				1: "connected",
				2: "connecting",
				3: "disconnecting"
			};

			const dbStats = await mongoose.connection.db?.stats();
			
			return {
				status: stateMap[state] || "unknown",
				readyState: state,
				collections: mongoose.connection.db ? Object.keys(mongoose.connection.db.collections).length : 0,
				dataSize: dbStats ? Math.round(dbStats.dataSize / 1024 / 1024) : 0,
				storageSize: dbStats ? Math.round(dbStats.storageSize / 1024 / 1024) : 0,
				indexes: dbStats?.indexes || 0
			};
		} catch (error) {
			return {
				status: "error",
				error: error.message
			};
		}
	}

	// Cache Health
	async getCacheHealth() {
		try {
			await cache.ping();
			return {
				status: "connected",
				type: "redis"
			};
		} catch (error) {
			return {
				status: "disconnected",
				error: error.message
			};
		}
	}

	// Calculate Overall Health Status
	calculateOverallHealth(health) {
		const issues = [];

		if (health.database.status !== "connected") {
			issues.push("database");
		}
		if (health.memory.percentage > 90) {
			issues.push("memory");
		}
		if (health.responseTime > 1000) {
			issues.push("performance");
		}
		if (health.cache.status !== "connected") {
			issues.push("cache");
		}

		if (issues.length === 0) return "healthy";
		if (issues.length <= 2) return "degraded";
		return "unhealthy";
	}

	// Performance Metrics
	async getPerformanceMetrics(timeRange = "1h") {
		const cacheKey = `monitoring:performance:${timeRange}`;
		
		const cached = await cache.get(cacheKey).catch(() => null);
		if (cached) return cached;

		// Mock performance data - in production, collect from APM tools
		const metrics = {
			timeRange,
			averageResponseTime: 145,
			requestsPerSecond: 25.5,
			errorRate: 0.02,
			throughput: 1530,
			endpoints: [
				{ path: "/api/v1/admin/stats", avgTime: 89, requests: 450 },
				{ path: "/api/v1/admin/users", avgTime: 156, requests: 320 },
				{ path: "/api/v1/admin/analytics", avgTime: 234, requests: 180 }
			],
			slowQueries: [
				{ query: "User.aggregate(analytics)", time: 890, count: 12 },
				{ query: "User.find(complex_filter)", time: 567, count: 8 }
			]
		};

		await cache.setex(cacheKey, 300, metrics);
		return metrics;
	}

	// Error Monitoring
	async getErrorLogs(options = {}) {
		const { page = 1, limit = 50, level = "all", timeRange = "24h" } = options;
		
		// Mock error logs - in production, integrate with logging service
		const errors = [
			{
				id: "err_001",
				timestamp: new Date(),
				level: "error",
				message: "Database connection timeout",
				stack: "MongoError: connection timeout...",
				endpoint: "/api/v1/admin/stats",
				userId: null,
				count: 3
			},
			{
				id: "err_002",
				timestamp: new Date(Date.now() - 60*60*1000),
				level: "warning",
				message: "High memory usage detected",
				details: { memoryUsage: "85%" },
				count: 1
			}
		];

		return {
			errors: errors.slice((page - 1) * limit, page * limit),
			pagination: {
				page,
				limit,
				total: errors.length,
				totalPages: Math.ceil(errors.length / limit)
			},
			summary: {
				totalErrors: errors.filter(e => e.level === "error").length,
				totalWarnings: errors.filter(e => e.level === "warning").length,
				criticalIssues: errors.filter(e => e.level === "critical").length
			}
		};
	}

	// Alert Configuration
	async configureAlerts(alertConfig) {
		const { type, threshold, recipients, enabled = true } = alertConfig;
		
		const alert = {
			id: `alert_${Date.now()}`,
			type,
			threshold,
			recipients,
			enabled,
			createdAt: new Date(),
			lastTriggered: null,
			triggerCount: 0
		};

		// In production, save to database
		// await AlertConfig.create(alert);

		return alert;
	}

	// Resource Usage Tracking
	async trackResourceUsage() {
		const usage = {
			timestamp: new Date(),
			memory: this.getMemoryUsage(),
			cpu: this.getCpuUsage(),
			database: await this.getDatabaseHealth(),
			activeConnections: mongoose.connections.length,
			eventLoopLag: this.getEventLoopLag()
		};

		// Store in time-series database or cache
		await cache.setex(`resource_usage:${Date.now()}`, 3600, usage);
		
		return usage;
	}

	// Event Loop Lag
	getEventLoopLag() {
		const start = process.hrtime.bigint();
		setImmediate(() => {
			const lag = Number(process.hrtime.bigint() - start) / 1000000;
			return lag;
		});
		return 0; // Simplified for demo
	}

	// API Performance Analysis
	async analyzeApiPerformance(timeRange = "24h") {
		// Mock API performance data
		const analysis = {
			timeRange,
			totalRequests: 15420,
			averageResponseTime: 156,
			p95ResponseTime: 450,
			p99ResponseTime: 890,
			errorRate: 0.02,
			slowestEndpoints: [
				{ endpoint: "/admin/analytics/overview", avgTime: 890, requests: 120 },
				{ endpoint: "/admin/users/export", avgTime: 2340, requests: 45 },
				{ endpoint: "/admin/stats", avgTime: 567, requests: 890 }
			],
			fastestEndpoints: [
				{ endpoint: "/admin/stats/live", avgTime: 23, requests: 2340 },
				{ endpoint: "/admin/users/:id", avgTime: 45, requests: 1560 }
			],
			recommendations: [
				"Consider adding database indexes for analytics queries",
				"Implement caching for frequently accessed user data",
				"Optimize bulk export operations with streaming"
			]
		};

		return analysis;
	}
}

export { MonitoringService };