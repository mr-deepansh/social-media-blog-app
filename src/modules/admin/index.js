// src/modules/admin/index.js

// Export all admin controllers
export * from "./controllers/admin.controller.js";
export * from "./controllers/analytics.controller.js";
export * from "./controllers/advanced.controller.js";

// Export all admin services
export * from "./services/cache.service.js";
export * from "./services/analytics.service.js";
export * from "./services/audit.service.js";
export * from "./services/exportImport.service.js";
export * from "./services/notification.service.js";
export * from "./services/queryBuilder.service.js";
export * from "./services/redis.service.js";
export * from "./services/security.service.js";
export * from "./services/validation.service.js";
export * from "./services/monitoring.service.js";
export * from "./services/automation.service.js";

// Export admin routes
export { default as adminRoutes } from "./routes/admin.routes.js";

// Export admin middleware (if any)
// export * from "./middleware/admin.middleware.js";

// Admin module configuration
export const adminConfig = {
	version: "2.0.0",
	features: {
		analytics: true,
		security: true,
		automation: true,
		monitoring: true,
		bulkOperations: true,
		realTimeStats: true,
		advancedReporting: true,
		enterpriseFeatures: true,
	},
	limits: {
		maxBulkOperations: 10000,
		maxExportRecords: 100000,
		cacheTimeout: 300,
		rateLimitRequests: 1000,
		rateLimitWindow: 3600,
	},
	security: {
		requireMFA: false,
		auditLogging: true,
		ipWhitelist: false,
		sessionTimeout: 3600,
	},
};
