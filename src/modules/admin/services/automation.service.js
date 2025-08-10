// src/modules/admin/services/automation.service.js
import { User } from "../../users/models/user.model.js";
import { NotificationService } from "./notification.service.js";
import { CacheService } from "./cache.service.js";
import auditService from "./audit.service.js";
import cron from "node-cron";

const cache = new CacheService();
const notificationService = new NotificationService();

class AutomationService {
	constructor() {
		this.activeRules = new Map();
		this.scheduledTasks = new Map();
		this.init();
	}

	// Initialize automation service
	async init() {
		console.log("🤖 Initializing Automation Service...");
		await this.loadActiveRules();
		await this.scheduleActiveTasks();
	}

	// Load active automation rules
	async loadActiveRules() {
		// In production, load from database
		const defaultRules = [
			{
				id: "auto_suspend_inactive",
				name: "Auto Suspend Inactive Users",
				description: "Suspend users inactive for 90+ days",
				trigger: "schedule",
				schedule: "0 2 * * 0", // Weekly at 2 AM Sunday
				conditions: {
					lastLoginBefore: "90d",
					isActive: true,
					excludeRoles: ["admin", "super_admin"]
				},
				actions: ["suspend", "notify_admin"],
				isActive: true,
				createdAt: new Date(),
				executionCount: 0
			},
			{
				id: "welcome_new_users",
				name: "Welcome New Users",
				description: "Send welcome email to new registrations",
				trigger: "user_created",
				conditions: {
					isEmailVerified: true
				},
				actions: ["send_welcome_email"],
				isActive: true,
				executionCount: 0
			},
			{
				id: "cleanup_unverified",
				name: "Cleanup Unverified Accounts",
				description: "Delete unverified accounts after 7 days",
				trigger: "schedule",
				schedule: "0 3 * * *", // Daily at 3 AM
				conditions: {
					isEmailVerified: false,
					createdBefore: "7d"
				},
				actions: ["delete", "log_cleanup"],
				isActive: true,
				executionCount: 0
			}
		];

		defaultRules.forEach(rule => {
			this.activeRules.set(rule.id, rule);
		});

		console.log(`✅ Loaded ${this.activeRules.size} automation rules`);
	}

	// Schedule active tasks
	async scheduleActiveTasks() {
		for (const [ruleId, rule] of this.activeRules) {
			if (rule.trigger === "schedule" && rule.schedule && rule.isActive) {
				await this.scheduleTask(ruleId, rule);
			}
		}
	}

	// Schedule individual task
	async scheduleTask(ruleId, rule) {
		try {
			const task = cron.schedule(rule.schedule, async () => {
				console.log(`🔄 Executing scheduled rule: ${rule.name}`);
				await this.executeRule(ruleId, rule);
			}, {
				scheduled: false,
				timezone: "UTC"
			});

			task.start();
			this.scheduledTasks.set(ruleId, task);
			
			console.log(`⏰ Scheduled task: ${rule.name} (${rule.schedule})`);
		} catch (error) {
			console.error(`❌ Failed to schedule task ${ruleId}:`, error.message);
		}
	}

	// Execute automation rule
	async executeRule(ruleId, rule, context = {}) {
		const startTime = Date.now();
		let result = {
			ruleId,
			ruleName: rule.name,
			startTime: new Date(),
			endTime: null,
			success: false,
			affectedCount: 0,
			errors: [],
			details: {}
		};

		try {
			console.log(`🚀 Executing rule: ${rule.name}`);

			// Build query based on conditions
			const query = await this.buildQuery(rule.conditions);
			
			// Get affected users/entities
			const affectedUsers = await this.getAffectedEntities(query, rule);
			result.affectedCount = affectedUsers.length;

			if (affectedUsers.length === 0) {
				console.log(`ℹ️ No entities match conditions for rule: ${rule.name}`);
				result.success = true;
				result.details.message = "No entities matched conditions";
			} else {
				// Execute actions
				const actionResults = await this.executeActions(rule.actions, affectedUsers, rule, context);
				result.details = actionResults;
				result.success = actionResults.success;
				result.errors = actionResults.errors;
			}

			// Update execution count
			rule.executionCount = (rule.executionCount || 0) + 1;
			rule.lastExecuted = new Date();

		} catch (error) {
			console.error(`❌ Rule execution failed: ${rule.name}`, error);
			result.errors.push(error.message);
			result.success = false;
		} finally {
			result.endTime = new Date();
			result.executionTime = Date.now() - startTime;

			// Log execution
			await this.logExecution(result);
		}

		return result;
	}

	// Build query from conditions
	async buildQuery(conditions) {
		const query = {};

		// Handle time-based conditions
		if (conditions.lastLoginBefore) {
			const days = parseInt(conditions.lastLoginBefore.replace('d', ''));
			query.lastLoginAt = { $lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
		}

		if (conditions.createdBefore) {
			const days = parseInt(conditions.createdBefore.replace('d', ''));
			query.createdAt = { $lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
		}

		// Handle boolean conditions
		if (conditions.isActive !== undefined) {
			query.isActive = conditions.isActive;
		}

		if (conditions.isEmailVerified !== undefined) {
			query.isEmailVerified = conditions.isEmailVerified;
		}

		// Handle exclusions
		if (conditions.excludeRoles && conditions.excludeRoles.length > 0) {
			query.role = { $nin: conditions.excludeRoles };
		}

		return query;
	}

	// Get affected entities
	async getAffectedEntities(query, rule) {
		try {
			// For now, assuming User model - extend for other entities
			const users = await User.find(query).lean();
			return users;
		} catch (error) {
			console.error("Failed to get affected entities:", error);
			return [];
		}
	}

	// Execute actions
	async executeActions(actions, entities, rule, context) {
		const result = {
			success: true,
			errors: [],
			actionResults: {},
			processedCount: 0
		};

		for (const action of actions) {
			try {
				const actionResult = await this.executeAction(action, entities, rule, context);
				result.actionResults[action] = actionResult;
				result.processedCount += actionResult.processedCount || 0;
			} catch (error) {
				console.error(`Action ${action} failed:`, error);
				result.errors.push(`${action}: ${error.message}`);
				result.success = false;
			}
		}

		return result;
	}

	// Execute individual action
	async executeAction(action, entities, rule, context) {
		const result = { processedCount: 0, details: [] };

		switch (action) {
			case "suspend":
				result.processedCount = await this.suspendUsers(entities, rule);
				break;

			case "delete":
				result.processedCount = await this.deleteUsers(entities, rule);
				break;

			case "send_welcome_email":
				result.processedCount = await this.sendWelcomeEmails(entities, rule);
				break;

			case "notify_admin":
				await this.notifyAdmins(entities, rule);
				result.processedCount = 1;
				break;

			case "log_cleanup":
				await this.logCleanupAction(entities, rule);
				result.processedCount = entities.length;
				break;

			default:
				throw new Error(`Unknown action: ${action}`);
		}

		return result;
	}

	// Suspend users
	async suspendUsers(users, rule) {
		let suspended = 0;
		const batchSize = 100;

		for (let i = 0; i < users.length; i += batchSize) {
			const batch = users.slice(i, i + batchSize);
			const userIds = batch.map(u => u._id);

			try {
				const updateResult = await User.updateMany(
					{ _id: { $in: userIds } },
					{
						isActive: false,
						suspendedAt: new Date(),
						suspensionReason: `Automated suspension: ${rule.name}`,
						suspendedBy: "system"
					}
				);

				suspended += updateResult.modifiedCount;
			} catch (error) {
				console.error(`Failed to suspend batch:`, error);
			}
		}

		console.log(`✅ Suspended ${suspended} users via automation`);
		return suspended;
	}

	// Delete users
	async deleteUsers(users, rule) {
		let deleted = 0;
		const batchSize = 50;

		for (let i = 0; i < users.length; i += batchSize) {
			const batch = users.slice(i, i + batchSize);
			const userIds = batch.map(u => u._id);

			try {
				const deleteResult = await User.deleteMany({ _id: { $in: userIds } });
				deleted += deleteResult.deletedCount;
			} catch (error) {
				console.error(`Failed to delete batch:`, error);
			}
		}

		console.log(`✅ Deleted ${deleted} users via automation`);
		return deleted;
	}

	// Send welcome emails
	async sendWelcomeEmails(users, rule) {
		let sent = 0;

		for (const user of users) {
			try {
				await notificationService.sendWelcomeEmail(user);
				sent++;
			} catch (error) {
				console.error(`Failed to send welcome email to ${user.email}:`, error);
			}
		}

		console.log(`✅ Sent ${sent} welcome emails via automation`);
		return sent;
	}

	// Notify admins
	async notifyAdmins(entities, rule) {
		const adminUsers = await User.find({ role: { $in: ["admin", "super_admin"] } }).lean();
		
		const notification = {
			subject: `Automation Alert: ${rule.name}`,
			message: `Automation rule "${rule.name}" processed ${entities.length} entities.`,
			type: "automation_alert",
			data: {
				ruleId: rule.id,
				ruleName: rule.name,
				affectedCount: entities.length,
				timestamp: new Date()
			}
		};

		for (const admin of adminUsers) {
			try {
				await notificationService.sendNotificationToUser({
					user: admin,
					notification,
					channels: ["email", "in-app"]
				});
			} catch (error) {
				console.error(`Failed to notify admin ${admin.email}:`, error);
			}
		}
	}

	// Log cleanup action
	async logCleanupAction(entities, rule) {
		const logData = {
			action: "automated_cleanup",
			rule: rule.name,
			ruleId: rule.id,
			affectedCount: entities.length,
			entities: entities.map(e => ({ id: e._id, email: e.email })),
			timestamp: new Date()
		};

		console.log(`📝 Cleanup log:`, logData);
		// In production, save to audit log
	}

	// Log execution
	async logExecution(result) {
		try {
			await auditService.logSystemActivity({
				action: "AUTOMATION_RULE_EXECUTED",
				details: result,
				level: result.success ? "info" : "error",
				timestamp: result.startTime
			});
		} catch (error) {
			console.error("Failed to log automation execution:", error);
		}
	}

	// Trigger rule manually
	async triggerRule(ruleId, context = {}) {
		const rule = this.activeRules.get(ruleId);
		if (!rule) {
			throw new Error(`Rule not found: ${ruleId}`);
		}

		if (!rule.isActive) {
			throw new Error(`Rule is inactive: ${ruleId}`);
		}

		return await this.executeRule(ruleId, rule, { ...context, manual: true });
	}

	// Create new automation rule
	async createRule(ruleData) {
		const rule = {
			id: `rule_${Date.now()}`,
			...ruleData,
			createdAt: new Date(),
			executionCount: 0,
			isActive: ruleData.isActive !== false
		};

		// Validate rule
		this.validateRule(rule);

		// Store rule
		this.activeRules.set(rule.id, rule);

		// Schedule if needed
		if (rule.trigger === "schedule" && rule.schedule && rule.isActive) {
			await this.scheduleTask(rule.id, rule);
		}

		console.log(`✅ Created automation rule: ${rule.name}`);
		return rule;
	}

	// Validate rule
	validateRule(rule) {
		if (!rule.name || !rule.trigger || !rule.actions) {
			throw new Error("Rule must have name, trigger, and actions");
		}

		if (rule.trigger === "schedule" && !rule.schedule) {
			throw new Error("Scheduled rules must have a schedule");
		}

		if (!Array.isArray(rule.actions) || rule.actions.length === 0) {
			throw new Error("Rule must have at least one action");
		}
	}

	// Update rule
	async updateRule(ruleId, updates) {
		const rule = this.activeRules.get(ruleId);
		if (!rule) {
			throw new Error(`Rule not found: ${ruleId}`);
		}

		// Stop existing scheduled task
		if (this.scheduledTasks.has(ruleId)) {
			this.scheduledTasks.get(ruleId).stop();
			this.scheduledTasks.delete(ruleId);
		}

		// Update rule
		Object.assign(rule, updates, { updatedAt: new Date() });
		this.validateRule(rule);

		// Reschedule if needed
		if (rule.trigger === "schedule" && rule.schedule && rule.isActive) {
			await this.scheduleTask(ruleId, rule);
		}

		return rule;
	}

	// Delete rule
	async deleteRule(ruleId) {
		const rule = this.activeRules.get(ruleId);
		if (!rule) {
			throw new Error(`Rule not found: ${ruleId}`);
		}

		// Stop scheduled task
		if (this.scheduledTasks.has(ruleId)) {
			this.scheduledTasks.get(ruleId).stop();
			this.scheduledTasks.delete(ruleId);
		}

		// Remove rule
		this.activeRules.delete(ruleId);

		console.log(`🗑️ Deleted automation rule: ${rule.name}`);
		return true;
	}

	// Get all rules
	getAllRules() {
		return Array.from(this.activeRules.values());
	}

	// Get rule by ID
	getRule(ruleId) {
		return this.activeRules.get(ruleId);
	}

	// Get execution history
	async getExecutionHistory(ruleId, options = {}) {
		const { page = 1, limit = 20 } = options;
		
		// Mock execution history - in production, fetch from database
		const history = [
			{
				id: "exec_001",
				ruleId,
				executedAt: new Date(),
				success: true,
				affectedCount: 15,
				executionTime: 2340,
				details: { suspended: 15 }
			}
		];

		return {
			executions: history.slice((page - 1) * limit, page * limit),
			pagination: {
				page,
				limit,
				total: history.length,
				totalPages: Math.ceil(history.length / limit)
			}
		};
	}
}

// Create singleton instance
const automationService = new AutomationService();

export { AutomationService, automationService };