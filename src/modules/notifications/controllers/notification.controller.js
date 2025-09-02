import { NotificationService } from "../services/notification.service.js";
import { NotificationHelper } from "../services/notification.helper.js";
import { ApiResponse } from "../../../shared/index.js";

const notificationService = new NotificationService();

export class NotificationController {
  /**
	 * Get user notifications
	 */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        type: req.query.type,
        isRead:
					req.query.isRead === "true"
					  ? true
					  : req.query.isRead === "false"
					    ? false
					    : undefined,
        priority: req.query.priority,
      };

      const result = await notificationService.getUserNotifications(
        userId,
        options,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, result, "Notifications fetched successfully"),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Mark notification as read
	 */
  async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await notificationService.markAsRead(
        notificationId,
        userId,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, notification, "Notification marked as read"),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Mark all notifications as read
	 */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.markAllAsRead(userId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, "All notifications marked as read"));
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Delete notification
	 */
  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const result = await notificationService.deleteNotification(
        notificationId,
        userId,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(200, result, "Notification deleted successfully"),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Get unread count
	 */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.getUnreadCount(userId);

      return res
        .status(200)
        .json(
          new ApiResponse(200, result, "Unread count fetched successfully"),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Create system notification (Admin only)
	 */
  async createSystemNotification(req, res, next) {
    try {
      const { recipients, title, message, data } = req.body;

      const result = await notificationService.createSystemNotification(
        recipients,
        title,
        message,
        data,
      );

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            result,
            "System notification created successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Get notification statistics
	 */
  async getNotificationStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await notificationService.getNotificationStats(userId);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            stats,
            "Notification statistics fetched successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Clear all notifications
	 */
  async clearAllNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.clearAllNotifications(userId);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            result,
            "All notifications cleared successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Get notification preferences
	 */
  async getNotificationPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const preferences =
				await notificationService.getNotificationPreferences(userId);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            preferences,
            "Notification preferences fetched successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Update notification preferences
	 */
  async updateNotificationPreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const preferences = req.body;
      const result = await notificationService.updateNotificationPreferences(
        userId,
        preferences,
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            result,
            "Notification preferences updated successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  /**
	 * Create test notification (for demonstration)
	 */
  async createTestNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { type = "like" } = req.body;

      // Create different types of test notifications
      const testNotifications = {
        like: {
          recipient: userId,
          sender: userId,
          type: "like",
          title: "Someone liked your post!",
          message: "Your post received a new like",
          data: {
            actionUrl: "/posts/test",
            metadata: { action: "like", timestamp: new Date() },
          },
          priority: "low",
        },
        comment: {
          recipient: userId,
          sender: userId,
          type: "comment",
          title: "New comment on your post",
          message: "Someone commented: 'Great post!'",
          data: {
            actionUrl: "/posts/test#comments",
            metadata: { action: "comment", timestamp: new Date() },
          },
          priority: "medium",
        },
        follow: {
          recipient: userId,
          sender: userId,
          type: "follow",
          title: "New follower!",
          message: "Someone started following you",
          data: {
            actionUrl: "/profile/test",
            metadata: { action: "follow", timestamp: new Date() },
          },
          priority: "medium",
        },
        welcome: {
          recipient: userId,
          sender: null,
          type: "welcome",
          title: "Welcome to our platform!",
          message: "Thanks for joining us. Start exploring!",
          data: {
            actionUrl: "/explore",
            metadata: { action: "welcome", timestamp: new Date() },
          },
          priority: "medium",
        },
      };

      const notificationData =
				testNotifications[type] || testNotifications.like;
      const result =
				await notificationService.createNotification(notificationData);

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            result,
						`Test ${type} notification created successfully`,
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
