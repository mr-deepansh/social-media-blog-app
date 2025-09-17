// src/shared/middleware/sessionTracker.middleware.js
import { SessionService } from "../services/session.service.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const sessionService = new SessionService();

/**
 * Middleware to track admin sessions
 */
const trackAdminSession = asyncHandler(async (req, res, next) => {
	// Only track admin and super_admin sessions
	if (req.user && ["admin", "super_admin"].includes(req.user.role)) {
		const sessionId = req.headers["x-session-id"] || `session_${req.user._id}_${Date.now()}`;
		const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
		const userAgent = req.headers["user-agent"] || "unknown";
		try {
			// Create or update session
			await sessionService.createSession({
				userId: req.user._id,
				sessionId,
				ipAddress,
				userAgent,
				role: req.user.role,
			});
			// Add session info to request
			req.sessionInfo = {
				sessionId,
				ipAddress,
				userAgent,
				role: req.user.role,
			};
		} catch (error) {
			console.warn("Session tracking failed:", error.message);
		}
	}
	next();
});

/**
 * Middleware to update session activity
 */
const updateSessionActivity = asyncHandler(async (req, res, next) => {
	if (req.sessionInfo?.sessionId) {
		try {
			await sessionService.updateActivity(req.sessionInfo.sessionId);
		} catch (error) {
			console.warn("Session activity update failed:", error.message);
		}
	}
	next();
});
export { trackAdminSession, updateSessionActivity };
