# Complete API Endpoints

## Admin API

Base path: `/api/v2/admin`

| Method | Path                                       | Controller                  | Required Data                                           | Body Data |
| :----- | :----------------------------------------- | :-------------------------- | :------------------------------------------------------ | :-------- |
| POST   | `/create-super-admin`                      | `createSuperAdmin`          | `username`, `email`, `password`, `secretKey` (optional) |           |
| GET    | `/dashboard`                               | `getAdminDashboard`         |                                                         |           |
| GET    | `/stats`                                   | `getAdminStats`             |                                                         |           |
| GET    | `/stats/live`                              | `getAdminStatsLive`         |                                                         |           |
| GET    | `/sessions/analytics`                      | `getAdminSessionAnalytics`  |                                                         |           |
| GET    | `/sessions/:adminId`                       | `getAdminSessionDetails`    | `adminId` (param)                                       |           |
| GET    | `/analytics/overview`                      | `getAnalyticsOverview`      |                                                         |           |
| GET    | `/analytics/users/growth`                  | `getUserGrowthAnalytics`    |                                                         |           |
| GET    | `/analytics/users/retention`               | `getUserRetentionAnalytics` |                                                         |           |
| GET    | `/analytics/users/demographics`            | `getUserDemographics`       |                                                         |           |
| GET    | `/analytics/engagement/metrics`            | `getEngagementMetrics`      |                                                         |           |
| GET    | `/security/suspicious-accounts`            | `getSuspiciousAccounts`     |                                                         |           |
| GET    | `/security/login-attempts`                 | `getLoginAttempts`          |                                                         |           |
| GET    | `/security/blocked-ips`                    | `getBlockedIps`             |                                                         |           |
| POST   | `/security/blocked-ips`                    | `blockIpAddress`            | `ip` (body)                                             |           |
| DELETE | `/security/blocked-ips/:ipId`              | `unblockIpAddress`          | `ipId` (param)                                          |           |
| GET    | `/security/threat-detection`               | `getThreatDetection`        |                                                         |           |
| GET    | `/content/posts`                           | `getAllPosts`               |                                                         |           |
| PATCH  | `/content/posts/:postId/toggle-visibility` | `togglePostVisibility`      | `postId` (param)                                        |           |
| GET    | `/config/app-settings`                     | `getAppSettings`            |                                                         |           |
| PUT    | `/config/app-settings`                     | `updateAppSettings`         |                                                         |           |
| GET    | `/notifications/templates`                 | `getNotificationTemplates`  |                                                         |           |
| POST   | `/notifications/send-bulk`                 | `sendBulkNotification`      |                                                         |           |
| GET    | `/monitoring/server-health`                | `getServerHealth`           |                                                         |           |
| GET    | `/monitoring/database-stats`               | `getDatabaseStats`          |                                                         |           |
| GET    | `/automation/rules`                        | `getAutomationRules`        |                                                         |           |
| POST   | `/automation/rules`                        | `createAutomationRule`      |                                                         |           |
| GET    | `/experiments`                             | `getExperiments`            |                                                         |           |
| POST   | `/experiments`                             | `createExperiment`          |                                                         |           |
| GET    | `/bi/revenue-analytics`                    | `getRevenueAnalytics`       |                                                         |           |
| GET    | `/bi/user-lifetime-value`                  | `getUserLifetimeValue`      |                                                         |           |
| GET    | `/admins`                                  | `getAllAdmins`              |                                                         |           |
| GET    | `/admins/:adminId`                         | `getAdminById`              | `adminId` (param)                                       |           |
| GET    | `/users/search`                            | `searchUsers`               |                                                         |           |
| GET    | `/users/export`                            | `bulkExportUsers`           |                                                         |           |
| POST   | `/users/bulk-actions`                      | `bulkActions`               |                                                         |           |
| GET    | `/users`                                   | `getAllUsers`               |                                                         |           |
| GET    | `/users/:id`                               | `getUserById`               | `id` (param)                                            |           |
| PUT    | `/users/:id`                               | `updateUserById`            | `id` (param)                                            |           |
| DELETE | `/users/:id`                               | `deleteUserById`            | `id` (param)                                            |           |
| PATCH  | `/users/:id/suspend`                       | `suspendUser`               | `id` (param)                                            |           |
| PATCH  | `/users/:id/activate`                      | `activateUser`              | `id` (param)                                            |           |
| PATCH  | `/users/:id/verify`                        | `verifyUserAccount`         | `id` (param)                                            |           |
| GET    | `/users/:id/activity-log`                  | `getUserActivityLog`        | `id` (param)                                            |           |
| GET    | `/users/:id/security-analysis`             | `getUserSecurityAnalysis`   | `id` (param)                                            |           |
| POST   | `/users/:id/notify`                        | `sendNotificationToUser`    | `id` (param)                                            |           |
| POST   | `/users/:id/force-password-reset`          | `forcePasswordReset`        | `id` (param)                                            |           |

## Super Admin API

Base path: `/api/v2/admin/super-admin`

| Method | Path                     | Controller           | Required Data                                                                | Body Data |
| :----- | :----------------------- | :------------------- | :--------------------------------------------------------------------------- | :-------- |
| POST   | `/create`                | `createSuperAdmin`   | `username`, `email`, `password`, `secretKey` (optional)                      |           |
| POST   | `/create-admin`          | `createAdmin`        | `username`, `email`, `password`, `role` (optional), `permissions` (optional) |           |
| GET    | `/admins`                | `getAllAdmins`       |                                                                              |           |
| PUT    | `/update-admin/:adminId` | `updateAdmin`        | `adminId` (param)                                                            |           |
| PUT    | `/change-role/:userId`   | `changeUserRole`     | `userId` (param)                                                             |           |
| GET    | `/system-config`         | `getSystemConfig`    |                                                                              |           |
| PUT    | `/system-config`         | `updateSystemConfig` |                                                                              |           |
| DELETE | `/delete-admin/:adminId` | `deleteAdmin`        | `adminId` (param)                                                            |           |
| GET    | `/audit-logs`            | `getAuditLogs`       |                                                                              |           |
| GET    | `/system-health`         | `getSystemHealth`    |                                                                              |           |
| POST   | `/emergency-lockdown`    | `emergencyLockdown`  |                                                                              |           |

## Auth API

Base path: `/api/v2/auth`

| Method | Path                           | Controller                | Required Data                                                | Body Data |
| :----- | :----------------------------- | :------------------------ | :----------------------------------------------------------- | :-------- |
| POST   | `/verify-email/:token`         | `verifyEmail`             | `token` (param)                                              |           |
| POST   | `/resend-verification`         | `resendEmailVerification` |                                                              |           |
| GET    | `/activity`                    | `getUserActivity`         |                                                              |           |
| GET    | `/activity/stats`              | `getActivityStats`        |                                                              |           |
| GET    | `/activity/locations`          | `getLoginLocations`       |                                                              |           |
| GET    | `/activity/location-analytics` | `getLocationAnalytics`    |                                                              |           |
| GET    | `/security-overview`           | `getSecurityOverview`     |                                                              |           |
| POST   | `/forgot-password`             | `forgetPassword`          | `email` (body)                                               |           |
| POST   | `/reset-password/:token`       | `resetPassword`           | `token` (param), `password` (body), `confirmPassword` (body) |           |

## Users API

Base path: `/api/v2/users`

| Method | Path                       | Controller                 | Required Data                                                               | Body Data                                                                                                                                                                 |
| :----- | :------------------------- | :------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/register`                | `registerUser`             | `username`, `email`, `password`, `confirmPassword`, `firstName`, `lastName` | `bio` (optional), `avatar` (optional), `role` (optional)                                                                                                                  |
| POST   | `/login`                   | `loginUser`                | `password`                                                                  | `identifier` (optional), `username` (optional), `email` (optional), `rememberMe` (optional)                                                                               |
| POST   | `/logout`                  | `logoutUser`               |                                                                             |                                                                                                                                                                           |
| POST   | `/refresh-token`           | `refreshAccessToken`       |                                                                             |                                                                                                                                                                           |
| POST   | `/verify-email/:token`     | `verifyEmail`              | `token` (param)                                                             |                                                                                                                                                                           |
| POST   | `/resend-verification`     | `resendEmailVerification`  |                                                                             |                                                                                                                                                                           |
| POST   | `/forgot-password`         | `forgotPassword`           | `email` (body)                                                              |                                                                                                                                                                           |
| POST   | `/reset-password/:token`   | `resetPassword`            | `token` (param), `password` (body), `confirmPassword` (body)                |                                                                                                                                                                           |
| GET    | `/profile`                 | `getCurrentUserProfile`    |                                                                             |                                                                                                                                                                           |
| GET    | `/profile/me`              | `getCurrentUserProfile`    |                                                                             |                                                                                                                                                                           |
| PUT    | `/profile`                 | `updateCurrentUserProfile` |                                                                             | `username` (optional), `firstName` (optional), `lastName` (optional), `bio` (optional), `avatar` (optional)                                                               |
| PUT    | `/profile/me`              | `updateCurrentUserProfile` |                                                                             | `username` (optional), `firstName` (optional), `lastName` (optional), `bio` (optional), `avatar` (optional)                                                               |
| GET    | `/feed`                    | `getUserFeed`              |                                                                             |                                                                                                                                                                           |
| GET    | `/search`                  | `searchUsers`              |                                                                             |                                                                                                                                                                           |
| POST   | `/follow/:userId`          | `followUser`               | `userId` (param)                                                            |                                                                                                                                                                           |
| POST   | `/unfollow/:userId`        | `unfollowUser`             | `userId` (param)                                                            |                                                                                                                                                                           |
| POST   | `/:userId/follow`          | `followUser`               | `userId` (param)                                                            |                                                                                                                                                                           |
| DELETE | `/:userId/follow`          | `unfollowUser`             | `userId` (param)                                                            |                                                                                                                                                                           |
| GET    | `/followers/:userId`       | `getUserFollowers`         | `userId` (param)                                                            |                                                                                                                                                                           |
| GET    | `/following/:userId`       | `getUserFollowing`         | `userId` (param)                                                            |                                                                                                                                                                           |
| GET    | `/:userId/followers`       | `getUserFollowers`         | `userId` (param)                                                            |                                                                                                                                                                           |
| GET    | `/:userId/following`       | `getUserFollowing`         | `userId` (param)                                                            |                                                                                                                                                                           |
| POST   | `/change-password`         | `changePassword`           | `currentPassword`, `newPassword`, `confirmNewPassword`                      |                                                                                                                                                                           |
| POST   | `/upload-avatar`           | `uploadAvatar`             | `avatar` (file)                                                             |                                                                                                                                                                           |
| POST   | `/upload-cover`            | `uploadCoverImage`         | `cover` (file)                                                              |                                                                                                                                                                           |
| GET    | `/profile/:username`       | `getUserProfile`           | `username` (param)                                                          |                                                                                                                                                                           |
| GET    | `/profile/:username/posts` | `getUserPosts`             | `username` (param)                                                          |                                                                                                                                                                           |
| GET    | `/:userId/follow-status`   | `getFollowStatus`          | `userId` (param)                                                            |                                                                                                                                                                           |
| GET    | `/`                        | `getAllUsers`              |                                                                             |                                                                                                                                                                           |
| GET    | `/:id`                     | `getUserById`              | `id` (param)                                                                |                                                                                                                                                                           |
| PUT    | `/:id`                     | `updateUser`               | `id` (param)                                                                | `username` (optional), `email` (optional), `firstName` (optional), `lastName` (optional), `bio` (optional), `avatar` (optional), `isActive` (optional), `role` (optional) |
| DELETE | `/:id`                     | `deleteUser`               | `id` (param)                                                                |                                                                                                                                                                           |

## Blogs API

Base path: `/api/v2/blogs`

### Posts

Base path: `/api/v2/blogs/posts`

| Method | Path              | Controller     | Required Data        | Body Data |
| :----- | :---------------- | :------------- | :------------------- | :-------- |
| POST   | `/`               | `createPost`   | `files` (file array) |           |
| GET    | `/my-posts`       | `getMyPosts`   |                      |           |
| GET    | `/`               | `getPosts`     |                      |           |
| GET    | `/user/:username` | `getUserPosts` | `username` (param)   |           |
| GET    | `/:id`            | `getPostById`  | `id` (param)         |           |
| PATCH  | `/:id`            | `updatePost`   | `id` (param)         |           |
| DELETE | `/:id`            | `deletePost`   | `id` (param)         |           |

### Comments

Base path: `/api/v2/blogs/comments`

| Method | Path       | Controller    | Required Data                      | Body Data |
| :----- | :--------- | :------------ | :--------------------------------- | :-------- |
| GET    | `/:postId` | `getComments` | `postId` (param)                   |           |
| POST   | `/:postId` | `addComment`  | `postId` (param), `content` (body) |           |

### Engagement

Base path: `/api/v2/blogs/engagement`

| Method | Path                | Controller       | Required Data    | Body Data |
| :----- | :------------------ | :--------------- | :--------------- | :-------- |
| POST   | `/:postId/like`     | `toggleLike`     | `postId` (param) |           |
| POST   | `/:postId/view`     | `trackView`      | `postId` (param) |           |
| POST   | `/:postId/repost`   | `repost`         | `postId` (param) |           |
| POST   | `/:postId/bookmark` | `toggleBookmark` | `postId` (param) |           |

### Media

Base path: `/api/v2/blogs/media`

| Method | Path        | Controller    | Required Data        | Body Data |
| :----- | :---------- | :------------ | :------------------- | :-------- |
| POST   | `/upload`   | `uploadMedia` | `files` (file array) |           |
| GET    | `/`         | `getMedia`    |                      |           |
| DELETE | `/:mediaId` | `deleteMedia` | `mediaId` (param)    |           |

### Analytics

Base path: `/api/v2/blogs/analytics`

| Method | Path                 | Controller               | Required Data | Body Data |
| :----- | :------------------- | :----------------------- | :------------ | :-------- |
| GET    | `/user`              | `getUserAnalytics`       |               |           |
| GET    | `/platform`          | `getPlatformAnalytics`   |               |           |
| GET    | `/post/:id`          | `getPostAnalytics`       | `id` (param)  |           |
| GET    | `/post/:id/realtime` | `getRealtimeEngagement`  | `id` (param)  |           |
| GET    | `/scheduled`         | `getScheduledPosts`      |               |           |
| GET    | `/scheduling`        | `getSchedulingAnalytics` |               |           |
| DELETE | `/scheduled/:id`     | `cancelScheduledPost`    | `id` (param)  |           |
| PATCH  | `/scheduled/:id`     | `reschedulePost`         | `id` (param)  |           |

## Notifications API

Base path: `/api/v2/notifications`

| Method | Path                    | Controller                      | Required Data                    | Body Data         |
| :----- | :---------------------- | :------------------------------ | :------------------------------- | :---------------- |
| GET    | `/`                     | `getNotifications`              |                                  |                   |
| GET    | `/unread-count`         | `getUnreadCount`                |                                  |                   |
| PATCH  | `/:notificationId/read` | `markAsRead`                    | `notificationId` (param)         |                   |
| PATCH  | `/mark-all-read`        | `markAllAsRead`                 |                                  |                   |
| DELETE | `/:notificationId`      | `deleteNotification`            | `notificationId` (param)         |                   |
| GET    | `/stats`                | `getNotificationStats`          |                                  |                   |
| DELETE | `/clear-all`            | `clearAllNotifications`         |                                  |                   |
| GET    | `/preferences`          | `getNotificationPreferences`    |                                  |                   |
| PUT    | `/preferences`          | `updateNotificationPreferences` |                                  |                   |
| POST   | `/test/create`          | `createTestNotification`        |                                  |                   |
| POST   | `/system`               | `createSystemNotification`      | `recipients`, `title`, `message` | `data` (optional) |
