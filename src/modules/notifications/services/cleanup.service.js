import { NotificationService } from "./notification.service.js";
import cron from "node-cron";

const notificationService = new NotificationService();

/**
 * Cleanup service for notifications
 */
export class NotificationCleanupService {
  /**
	 * Start the cleanup scheduler
	 */
  static startCleanupScheduler() {
    // Run cleanup every day at 2 AM
    cron.schedule("0 2 * * *", async () => {
      try {
        console.log("🧹 Starting notification cleanup...");
        const result = await notificationService.cleanupExpiredNotifications();
        console.log(
					`✅ Cleaned up ${result.deletedCount} expired notifications`,
        );
      } catch (error) {
        console.error("❌ Notification cleanup failed:", error);
      }
    });

    console.log("📅 Notification cleanup scheduler started (daily at 2 AM)");
  }

  /**
	 * Manual cleanup (for testing or manual execution)
	 */
  static async runCleanup() {
    try {
      console.log("🧹 Running manual notification cleanup...");
      const result = await notificationService.cleanupExpiredNotifications();
      console.log(`✅ Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error("❌ Manual notification cleanup failed:", error);
      throw error;
    }
  }
}
