// src/modules/admin/services/security.service.js
import { User } from "../../users/models/user.model.js";
import mongoose from "mongoose";

// Mock models for security features - implement actual models as needed
const BlockedIP = {
  find: () => ({ lean: () => [], limit: () => ({ skip: () => [] }) }),
  countDocuments: () => 0,
  create: data => ({
    ...data,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
  }),
};

const LoginAttempt = {
  find: () => ({ lean: () => [], limit: () => ({ skip: () => [] }) }),
  countDocuments: () => 0,
};

export class SecurityService {
  /**
	 * Get suspicious accounts based on various risk factors
	 * @param {Object} options - Query options
	 */
  async getSuspiciousAccounts(options = {}) {
    const { page = 1, limit = 20, riskLevel = "all" } = options;
    const skip = (page - 1) * limit;
    // Build risk assessment pipeline
    const pipeline = [
      {
        $addFields: {
          riskScore: {
            $add: [
              // Multiple failed login attempts
              { $cond: [{ $gt: ["$failedLoginAttempts", 5] }, 2, 0] },
              // Account created recently but inactive
              {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)],
                      },
                      { $eq: ["$isActive", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
              // No profile information
              {
                $cond: [
                  {
                    $or: [{ $eq: ["$firstName", ""] }, { $eq: ["$firstName", null] }],
                  },
                  1,
                  0,
                ],
              },
              // Suspicious email patterns
              {
                $cond: [{ $regexMatch: { input: "$email", regex: /\d{5,}/ } }, 1, 0],
              },
            ],
          },
          riskLevel: {
            $switch: {
              branches: [
                { case: { $gte: ["$riskScore", 4] }, then: "HIGH" },
                { case: { $gte: ["$riskScore", 2] }, then: "MEDIUM" },
                { case: { $gt: ["$riskScore", 0] }, then: "LOW" },
              ],
              default: "NONE",
            },
          },
        },
      },
      {
        $match: {
          riskScore: { $gt: 0 },
          ...(riskLevel !== "all" && { riskLevel: riskLevel.toUpperCase() }),
        },
      },
      {
        $project: {
          username: 1,
          email: 1,
          createdAt: 1,
          isActive: 1,
          lastLoginAt: 1,
          riskScore: 1,
          riskLevel: 1,
          riskFactors: {
            $filter: {
              input: [
                {
                  $cond: [{ $gt: ["$failedLoginAttempts", 5] }, "Multiple failed logins", null],
                },
                {
                  $cond: [
                    {
                      $and: [
                        {
                          $gt: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)],
                        },
                        { $eq: ["$isActive", false] },
                      ],
                    },
                    "Recently created but inactive",
                    null,
                  ],
                },
                {
                  $cond: [
                    {
                      $or: [{ $eq: ["$firstName", ""] }, { $eq: ["$firstName", null] }],
                    },
                    "Incomplete profile",
                    null,
                  ],
                },
                {
                  $cond: [{ $regexMatch: { input: "$email", regex: /\d{5,}/ } }, "Suspicious email pattern", null],
                },
              ],
              cond: { $ne: ["$$this", null] },
            },
          },
        },
      },
      { $sort: { riskScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];
    const [accounts, totalCount] = await Promise.all([
      User.aggregate(pipeline),
      User.aggregate([
        ...pipeline.slice(0, -2), // Remove skip and limit
        { $count: "total" },
      ]).then(result => result[0]?.total || 0),
    ]);
    return {
      accounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
      summary: {
        totalSuspicious: totalCount,
        highRisk: accounts.filter(a => a.riskLevel === "HIGH").length,
        mediumRisk: accounts.filter(a => a.riskLevel === "MEDIUM").length,
        lowRisk: accounts.filter(a => a.riskLevel === "LOW").length,
      },
    };
  }
  /**
	 * Get login attempts with filtering
	 * @param {Object} options - Query options
	 */
  async getLoginAttempts(options = {}) {
    const { status = "all", timeRange = "24h", page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;
    // Parse time range
    const hours = this.parseTimeRange(timeRange);
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    // Mock data for now - implement with actual LoginAttempt model
    const mockAttempts = Array.from({ length: Math.min(limit, 25) }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      email: `user${i + 1}@example.com`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      success: Math.random() > 0.3,
      timestamp: new Date(Date.now() - Math.random() * hours * 60 * 60 * 1000),
      location: "Unknown",
      reason: Math.random() > 0.7 ? "Invalid credentials" : null,
    }));
    const filteredAttempts =
			status === "all"
				? mockAttempts
				: mockAttempts.filter(attempt => (status === "success" ? attempt.success : !attempt.success));
    return {
      attempts: filteredAttempts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredAttempts.length / limit),
        totalCount: filteredAttempts.length,
        limit,
      },
      summary: {
        total: filteredAttempts.length,
        successful: filteredAttempts.filter(a => a.success).length,
        failed: filteredAttempts.filter(a => !a.success).length,
        timeRange,
      },
    };
  }

  /**
	 * Block an IP address
	 * @param {Object} data - Block data
	 */
  async blockIpAddress(data) {
    const { ipAddress, reason, duration, blockedBy } = data;

    // Validate IP address format
    if (!this.isValidIP(ipAddress)) {
      throw new Error("Invalid IP address format");
    }
    // Calculate expiry date
    let expiresAt = null;
    if (duration !== "permanent") {
      const seconds = this.parseDuration(duration);
      expiresAt = new Date(Date.now() + seconds * 1000);
    }
    // Mock creation - implement with actual BlockedIP model
    const blockedIP = await BlockedIP.create({
      ipAddress,
      reason,
      duration,
      expiresAt,
      blockedBy,
      isActive: true,
      createdAt: new Date(),
    });
    return {
      id: blockedIP._id,
      ipAddress: blockedIP.ipAddress,
      reason: blockedIP.reason,
      duration: blockedIP.duration,
      expiresAt: blockedIP.expiresAt,
      blockedAt: blockedIP.createdAt,
      status: "blocked",
    };
  }

  /**
	 * Get blocked IP addresses
	 * @param {Object} options - Query options
	 */
  async getBlockedIps(options = {}) {
    const { page = 1, limit = 20, status = "active" } = options;
    const skip = (page - 1) * limit;

    // Mock data - implement with actual BlockedIP model
    const mockBlockedIPs = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      reason: `Suspicious activity detected - ${i + 1}`,
      duration: Math.random() > 0.5 ? "permanent" : "24h",
      expiresAt: Math.random() > 0.5 ? null : new Date(Date.now() + 24 * 60 * 60 * 1000),
      blockedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      isActive: status === "active",
    }));
    return {
      blockedIPs: mockBlockedIPs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(mockBlockedIPs.length / limit),
        totalCount: mockBlockedIPs.length,
        limit,
      },
      summary: {
        total: mockBlockedIPs.length,
        active: mockBlockedIPs.filter(ip => ip.isActive).length,
        expired: mockBlockedIPs.filter(ip => !ip.isActive).length,
      },
    };
  }

  /**
	 * Get threat detection summary
	 */
  async getThreatDetection() {
    // Mock threat detection data
    return {
      threatLevel: "LOW",
      activeThreats: 0,
      blockedIPs: Math.floor(Math.random() * 50) + 10,
      suspiciousActivity: Math.floor(Math.random() * 10),
      recentIncidents: [
        {
          type: "multiple_failed_logins",
          ip: "192.168.1.100",
          attempts: 5,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "blocked",
        },
        {
          type: "suspicious_user_agent",
          ip: "10.0.0.50",
          userAgent: "Bot/1.0",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: "monitoring",
        },
      ],
      recommendations: [
        "Enable MFA for all admin accounts",
        "Review IP whitelist settings",
        "Update security policies",
      ],
      lastScan: new Date().toISOString(),
    };
  }

  /**
	 * Unblock an IP address
	 * @param {Object} data - Unblock data
	 */
  async unblockIpAddress(data) {
    const { ipId, reason, unblockedBy } = data;

    // Mock unblock - implement with actual BlockedIP model
    return {
      id: ipId,
      status: "unblocked",
      unblockedAt: new Date(),
      unblockedBy,
      reason,
    };
  }
  /**
	 * Emergency system lockdown
	 * @param {Object} data - Lockdown data
	 */
  async emergencyLockdown(data) {
    const { reason, duration, initiatedBy } = data;

    // Mock lockdown implementation
    return {
      lockdownId: new mongoose.Types.ObjectId(),
      status: "active",
      reason,
      duration,
      initiatedBy,
      initiatedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 1000),
      affectedServices: ["user_registration", "password_reset", "api_access"],
    };
  }
  // Helper methods
  parseTimeRange(timeRange) {
    const match = timeRange.match(/(\d+)([hd])/);
    if (!match) {
      return 24;
    } // default 24 hours

    const [, num, unit] = match;
    const multipliers = { h: 1, d: 24 };
    return parseInt(num) * (multipliers[unit] || 1);
  }
  parseDuration(duration) {
    const match = duration.match(/(\d+)([smhd])/);
    if (!match) {
      return 3600;
    } // default 1 hour
    const [, num, unit] = match;
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(num) * (multipliers[unit] || 1);
  }
  isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
}
