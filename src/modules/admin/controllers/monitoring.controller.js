// src/modules/admin/controllers/monitoring.controller.js
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { SystemService } from "../services/system.service.js";
import { CacheService } from "../../../shared/services/cache.service.js";

const systemService = new SystemService();
const cache = new CacheService();

/**
 * Get server health metrics
 * @route GET /admin/monitoring/server-health
 * @access Admin, Super Admin
 */
export const getServerHealth = asyncHandler(async (req, res) => {
  const cacheKey = "monitoring:server-health";

  // Try cache first (short TTL for health data)
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(new ApiResponse(200, cached, "Server health from cache"));
  }

  const health = await systemService.getServerHealth();

  // Cache for 30 seconds
  await cache.set(cacheKey, health, 30);

  return res.status(200).json(new ApiResponse(200, health, "Server health retrieved"));
});

/**
 * Get database statistics
 * @route GET /admin/monitoring/database-stats
 * @access Admin, Super Admin
 */
export const getDatabaseStats = asyncHandler(async (req, res) => {
  const cacheKey = "monitoring:database-stats";

  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(new ApiResponse(200, cached, "Database stats from cache"));
  }

  const stats = await systemService.getDatabaseStats();

  // Cache for 5 minutes
  await cache.set(cacheKey, stats, 300);

  return res.status(200).json(new ApiResponse(200, stats, "Database statistics retrieved"));
});

/**
 * Get system configuration
 * @route GET /admin/super-admin/system-config
 * @access Super Admin Only
 */
export const getSystemConfig = asyncHandler(async (req, res) => {
  const config = await systemService.getSystemConfig();

  return res.status(200).json(new ApiResponse(200, config, "System configuration retrieved"));
});

/**
 * Update system configuration
 * @route PUT /admin/super-admin/system-config
 * @access Super Admin Only
 */
export const updateSystemConfig = asyncHandler(async (req, res) => {
  const { security, features, limits } = req.body;

  // Mock update - in production, this would update actual configuration
  const updatedConfig = {
    ...(await systemService.getSystemConfig()),
    ...(security && { security: { ...security } }),
    ...(features && { features: { ...features } }),
    ...(limits && { limits: { ...limits } }),
    updatedAt: new Date().toISOString(),
    updatedBy: req.user._id,
  };

  return res.status(200).json(new ApiResponse(200, updatedConfig, "System configuration updated"));
});

/**
 * Emergency system lockdown
 * @route POST /admin/super-admin/emergency-lockdown
 * @access Super Admin Only
 */
export const emergencyLockdown = asyncHandler(async (req, res) => {
  const { reason, duration = 3600, confirmPassword } = req.body;

  if (!reason || reason.trim().length < 20) {
    throw new ApiError(400, "Detailed reason is required (minimum 20 characters)");
  }

  if (process.env.NODE_ENV === "production" && !confirmPassword) {
    throw new ApiError(400, "Password confirmation required for emergency lockdown");
  }

  const lockdown = await systemService.emergencyLockdown({
    reason: reason.trim(),
    duration,
    initiatedBy: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, lockdown, "Emergency lockdown initiated"));
});
