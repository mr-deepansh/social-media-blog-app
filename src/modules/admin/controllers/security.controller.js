// src/modules/admin/controllers/security.controller.js
import { User } from "../../users/models/user.model.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import { ApiResponse } from "../../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../../shared/utils/AsyncHandler.js";
import { SecurityService } from "../services/security.service.js";
import { CacheService } from "../../../shared/services/cache.service.js";
import auditService from "../services/audit.service.js";

const securityService = new SecurityService();
const cache = new CacheService();

// Controller for security-related admin operations
export const getSuspiciousAccounts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, riskLevel = "all" } = req.query;
  const result = await securityService.getSuspiciousAccounts({
    page: parseInt(page),
    limit: parseInt(limit),
    riskLevel,
  });
  // Log security monitoring activity (optional - skip if fails)
  try {
    await auditService.logAdminActivity({
      adminId: req.user._id,
      action: "VIEW_SECURITY",
      details: { type: "suspicious_accounts", riskLevel, resultCount: result?.data?.length || 0 },
    });
  } catch (error) {
    // Ignore audit log errors
  }
  return res.status(200).json(new ApiResponse(200, result, "Suspicious accounts retrieved"));
});

// Get login attempts with filtering and pagination
export const getLoginAttempts = asyncHandler(async (req, res) => {
  const { status = "all", timeRange = "24h", page = 1, limit = 50 } = req.query;
  const result = await securityService.getLoginAttempts({
    status,
    timeRange,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return res.status(200).json(new ApiResponse(200, result, "Login attempts retrieved"));
});

// Block an IP address
export const blockIpAddress = asyncHandler(async (req, res) => {
  const { ipAddress, reason, duration = "permanent" } = req.body;
  if (!ipAddress || !reason) {
    throw new ApiError(400, "IP address and reason are required");
  }
  const result = await securityService.blockIpAddress({
    ipAddress,
    reason,
    duration,
    blockedBy: req.user._id,
  });
  // Log critical security action
  await auditService.logAdminActivity({
    adminId: req.user._id,
    action: "BLOCK_IP_ADDRESS",
    details: { ipAddress, reason, duration },
    criticality: "HIGH",
  });
  return res.status(200).json(new ApiResponse(200, result, "IP address blocked successfully"));
});

// Get blocked IPs with filtering and pagination
export const getBlockedIps = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = "active" } = req.query;
  const result = await securityService.getBlockedIps({
    page: parseInt(page),
    limit: parseInt(limit),
    status,
  });
  return res.status(200).json(new ApiResponse(200, result, "Blocked IPs retrieved"));
});

// Get threat detection summary with caching
export const getThreatDetection = asyncHandler(async (req, res) => {
  const cacheKey = "security:threat-detection";
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(new ApiResponse(200, cached, "Threat detection from cache"));
  }
  const threats = await securityService.getThreatDetection();
  // Cache for 5 minutes
  await cache.set(cacheKey, threats, 300);
  return res.status(200).json(new ApiResponse(200, threats, "Threat detection summary"));
});

// Unblock an IP address
export const unblockIpAddress = asyncHandler(async (req, res) => {
  const { ipId } = req.params;
  const { reason } = req.body;
  const result = await securityService.unblockIpAddress({
    ipId,
    reason,
    unblockedBy: req.user._id,
  });
  await auditService.logAdminActivity({
    adminId: req.user._id,
    action: "UNBLOCK_IP_ADDRESS",
    details: { ipId, reason },
  });
  return res.status(200).json(new ApiResponse(200, result, "IP address unblocked successfully"));
});
