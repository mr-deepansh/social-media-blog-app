# 🚀 EndlessChatt API Documentation

**Complete API Reference for EndlessChatt Social Media Platform**

_Version: 2.0.0 | Base URL: `http://localhost:5000/api/v2`_

---

## 📋 Table of Contents

- [🔐 Authentication & Security](#-authentication--security)
- [👤 User Management](#-user-management)
- [💬 Chat & Messaging](#-chat--messaging)
- [📁 Media & File Management](#-media--file-management)
- [🔔 Notifications](#-notifications)
- [👑 Admin & Moderation](#-admin--moderation)
- [📊 Analytics & Insights](#-analytics--insights)
- [⚙️ System & Configuration](#️-system--configuration)
- [🔍 Search & Discovery](#-search--discovery)
- [🌐 Social Features](#-social-features)

---

## 🔐 Authentication & Security

| #   | Method | URL                                             | Endpoint Name       | Headers Required                                                       | Body Data Type | Body Data                                                                                                                                                                              | Summary                                   |
| --- | ------ | ----------------------------------------------- | ------------------- | ---------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | POST   | `/api/v2/users/register`                        | User Registration   | Content-Type: application/json                                         | JSON           | `{"username": "johndoe", "email": "john@example.com", "password": "SecurePass123!", "confirmPassword": "SecurePass123!", "firstName": "John", "lastName": "Doe", "acceptTerms": true}` | Register new user account                 |
| 2   | POST   | `/api/v2/auth/login`                            | User Login          | Content-Type: application/json                                         | JSON           | `{"identifier": "john@example.com", "password": "SecurePass123!", "rememberMe": false, "deviceInfo": {"userAgent": "Mozilla/5.0...", "platform": "web"}}`                              | Authenticate user and get access token    |
| 3   | POST   | `/api/v2/auth/refresh`                          | Refresh Token       | Authorization: Bearer {refreshToken}<br>Content-Type: application/json | JSON           | `{"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}`                                                                                                                          | Refresh expired access token              |
| 4   | POST   | `/api/v2/users/logout`                          | User Logout         | Authorization: Bearer {accessToken}                                    | JSON           | `{"logoutFromAllDevices": false}`                                                                                                                                                      | Logout user from current device           |
| 5   | POST   | `/api/v2/users/logout-all`                      | Logout All Devices  | Authorization: Bearer {accessToken}                                    | JSON           | `{}`                                                                                                                                                                                   | Logout user from all devices              |
| 6   | POST   | `/api/v2/auth/forgot-password`                  | Forgot Password     | Content-Type: application/json                                         | JSON           | `{"email": "john@example.com"}`                                                                                                                                                        | Send password reset email                 |
| 7   | POST   | `/api/v2/auth/reset-password/{resetToken}`      | Reset Password      | Content-Type: application/json                                         | JSON           | `{"password": "NewSecurePass123!", "confirmPassword": "NewSecurePass123!"}`                                                                                                            | Reset password using token from email     |
| 8   | PUT    | `/api/v2/users/change-password`                 | Change Password     | Authorization: Bearer {accessToken}<br>Content-Type: application/json  | JSON           | `{"currentPassword": "SecurePass123!", "newPassword": "NewSecurePass123!", "confirmPassword": "NewSecurePass123!"}`                                                                    | Change password for authenticated user    |
| 9   | POST   | `/api/v2/auth/verify-email/{verificationToken}` | Verify Email        | -                                                                      | -              | -                                                                                                                                                                                      | Verify email address using token          |
| 10  | POST   | `/api/v2/auth/resend-verification`              | Resend Verification | Authorization: Bearer {accessToken}                                    | JSON           | `{}`                                                                                                                                                                                   | Resend email verification                 |
| 11  | POST   | `/api/v2/auth/2fa/enable`                       | Enable 2FA          | Authorization: Bearer {accessToken}                                    | JSON           | `{"password": "SecurePass123!"}`                                                                                                                                                       | Enable two-factor authentication          |
| 12  | POST   | `/api/v2/auth/2fa/verify-setup`                 | Verify 2FA Setup    | Authorization: Bearer {accessToken}                                    | JSON           | `{"token": "123456"}`                                                                                                                                                                  | Verify 2FA setup with token               |
| 13  | POST   | `/api/v2/auth/2fa/disable`                      | Disable 2FA         | Authorization: Bearer {accessToken}                                    | JSON           | `{"password": "SecurePass123!", "token": "123456"}`                                                                                                                                    | Disable two-factor authentication         |
| 14  | GET    | `/api/v2/auth/sessions`                         | Get Active Sessions | Authorization: Bearer {accessToken}                                    | -              | -                                                                                                                                                                                      | Get all active user sessions              |
| 15  | DELETE | `/api/v2/auth/sessions/{sessionId}`             | Revoke Session      | Authorization: Bearer {accessToken}                                    | -              | -                                                                                                                                                                                      | Revoke specific session                   |
| 16  | GET    | `/api/v2/auth/security-overview`                | Security Overview   | Authorization: Bearer {accessToken}                                    | -              | -                                                                                                                                                                                      | Get security overview and recent activity |
| 17  | GET    | `/api/v2/auth/login-history`                    | Login History       | Authorization: Bearer {accessToken}                                    | -              | -                                                                                                                                                                                      | Get user login history with pagination    |

---

## 👤 User Management

| #   | Method | URL                                 | Endpoint Name        | Headers Required                                                         | Body Data Type | Body Data                                                                                                                                                                                                                                                                 | Summary                                |
| --- | ------ | ----------------------------------- | -------------------- | ------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 18  | GET    | `/api/v2/users/me`                  | Get Current User     | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Get current authenticated user profile |
| 19  | PUT    | `/api/v2/users/me`                  | Update Profile       | Authorization: Bearer {accessToken}<br>Content-Type: application/json    | JSON           | `{"firstName": "John", "lastName": "Doe", "bio": "Software developer", "location": "San Francisco, CA", "website": "https://johndoe.dev", "dateOfBirth": "1990-01-15", "privacy": {"profileVisibility": "public", "showEmail": false, "showLastSeen": true}}`             | Update user profile information        |
| 20  | POST   | `/api/v2/users/me/avatar`           | Upload Avatar        | Authorization: Bearer {accessToken}<br>Content-Type: multipart/form-data | Form Data      | `avatar: [file]`                                                                                                                                                                                                                                                          | Upload profile picture (file upload)   |
| 21  | PUT    | `/api/v2/users/me/avatar`           | Update Avatar URL    | Authorization: Bearer {accessToken}<br>Content-Type: application/json    | JSON           | `{"avatarUrl": "https://example.com/avatar.jpg"}`                                                                                                                                                                                                                         | Update profile picture using URL       |
| 22  | DELETE | `/api/v2/users/me/avatar`           | Delete Avatar        | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Remove profile picture                 |
| 23  | GET    | `/api/v2/users/{userId}`            | Get User by ID       | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Get user profile by ID                 |
| 24  | GET    | `/api/v2/users/username/{username}` | Get User by Username | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Get user profile by username           |
| 25  | GET    | `/api/v2/users/search`              | Search Users         | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Search users by query with filters     |
| 26  | GET    | `/api/v2/users/suggestions`         | Get Suggestions      | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Get suggested users to connect with    |
| 27  | GET    | `/api/v2/users/me/preferences`      | Get Preferences      | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                                                                                                                                         | Get user preferences and settings      |
| 28  | PUT    | `/api/v2/users/me/preferences`      | Update Preferences   | Authorization: Bearer {accessToken}<br>Content-Type: application/json    | JSON           | `{"notifications": {"email": true, "push": true, "sms": false, "inApp": true}, "privacy": {"profileVisibility": "friends", "messageRequests": "everyone", "onlineStatus": "friends"}, "appearance": {"theme": "dark", "language": "en", "timezone": "America/New_York"}}` | Update user preferences                |

---

## 💬 Chat & Messaging

| #   | Method | URL                                                    | Endpoint Name       | Headers Required                                                      | Body Data Type | Body Data                                                                                                                                                                                                                 | Summary                                |
| --- | ------ | ------------------------------------------------------ | ------------------- | --------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 29  | GET    | `/api/v2/chat/conversations`                           | Get Conversations   | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                                                                                                         | Get user conversations with pagination |
| 30  | POST   | `/api/v2/chat/conversations`                           | Start Conversation  | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"participantIds": ["user123", "user456"], "type": "direct", "initialMessage": "Hello there!"}`                                                                                                                          | Start new conversation                 |
| 31  | GET    | `/api/v2/chat/conversations/{conversationId}/messages` | Get Messages        | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                                                                                                         | Get messages from conversation         |
| 32  | POST   | `/api/v2/chat/conversations/{conversationId}/messages` | Send Message        | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"content": {"text": "Hello, how are you?", "type": "text"}, "replyTo": "messageId", "metadata": {"mentions": ["@user123"], "attachments": []}}`                                                                         | Send message to conversation           |
| 33  | PUT    | `/api/v2/chat/messages/{messageId}`                    | Edit Message        | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"content": {"text": "Updated message content", "editedAt": "2024-01-15T10:30:00Z"}}`                                                                                                                                    | Edit existing message                  |
| 34  | DELETE | `/api/v2/chat/messages/{messageId}`                    | Delete Message      | Authorization: Bearer {accessToken}                                   | JSON           | `{"deleteFor": "everyone"}`                                                                                                                                                                                               | Delete message                         |
| 35  | POST   | `/api/v2/chat/messages/{messageId}/reactions`          | React to Message    | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"emoji": "👍", "action": "add"}`                                                                                                                                                                                        | Add/remove reaction to message         |
| 36  | PUT    | `/api/v2/chat/conversations/{conversationId}/read`     | Mark as Read        | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"lastReadMessageId": "messageId123"}`                                                                                                                                                                                   | Mark messages as read                  |
| 37  | POST   | `/api/v2/chat/groups`                                  | Create Group        | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"name": "Project Team", "description": "Discussion for our awesome project", "participantIds": ["user123", "user456", "user789"], "settings": {"isPrivate": false, "allowInvites": true, "messageHistory": "visible"}}` | Create new group chat                  |
| 38  | PUT    | `/api/v2/chat/groups/{groupId}`                        | Update Group        | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"name": "Updated Group Name", "description": "Updated description", "avatar": "https://example.com/group-avatar.jpg"}`                                                                                                  | Update group information               |
| 39  | POST   | `/api/v2/chat/groups/{groupId}/members`                | Add Group Members   | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"userIds": ["user123", "user456"]}`                                                                                                                                                                                     | Add members to group                   |
| 40  | DELETE | `/api/v2/chat/groups/{groupId}/members/{userId}`       | Remove Group Member | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                                                                                                         | Remove member from group               |
| 41  | POST   | `/api/v2/chat/groups/{groupId}/leave`                  | Leave Group         | Authorization: Bearer {accessToken}                                   | JSON           | `{}`                                                                                                                                                                                                                      | Leave group chat                       |
| 42  | PUT    | `/api/v2/chat/groups/{groupId}/members/{userId}/role`  | Update Member Role  | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"role": "admin"}`                                                                                                                                                                                                       | Update member role in group            |
| 43  | POST   | `/api/v2/chat/messages/{messageId}/thread`             | Create Thread       | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"content": {"text": "This is a thread reply", "type": "text"}}`                                                                                                                                                         | Create thread reply to message         |
| 44  | GET    | `/api/v2/chat/messages/{messageId}/thread`             | Get Thread Messages | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                                                                                                         | Get thread messages                    |

---

## 📁 Media & File Management

| #   | Method | URL                                       | Endpoint Name         | Headers Required                                                         | Body Data Type | Body Data                                                                                                                                           | Summary                            |
| --- | ------ | ----------------------------------------- | --------------------- | ------------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 45  | POST   | `/api/v2/media/upload`                    | Upload File           | Authorization: Bearer {accessToken}<br>Content-Type: multipart/form-data | Form Data      | `file: [file]`<br>`type: "image"`<br>`folder: "chat"`                                                                                               | Upload single file                 |
| 46  | POST   | `/api/v2/media/upload/batch`              | Upload Multiple Files | Authorization: Bearer {accessToken}<br>Content-Type: multipart/form-data | Form Data      | `files: [file1, file2, file3]`<br>`type: "image"`<br>`folder: "chat"`                                                                               | Upload multiple files              |
| 47  | GET    | `/api/v2/media/files/{fileId}`            | Get File Info         | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                   | Get file information               |
| 48  | DELETE | `/api/v2/media/files/{fileId}`            | Delete File           | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                   | Delete file                        |
| 49  | POST   | `/api/v2/media/images/{imageId}/variants` | Generate Variants     | Authorization: Bearer {accessToken}<br>Content-Type: application/json    | JSON           | `{"variants": [{"name": "thumbnail", "width": 150, "height": 150, "quality": 80}, {"name": "medium", "width": 500, "height": 500, "quality": 90}]}` | Generate image variants/thumbnails |
| 50  | GET    | `/api/v2/media/files`                     | Get User Files        | Authorization: Bearer {accessToken}                                      | -              | -                                                                                                                                                   | Get user uploaded files            |

---

## 🔔 Notifications

| #   | Method | URL                                           | Endpoint Name       | Headers Required                                                      | Body Data Type | Body Data                                                                                                            | Summary                                |
| --- | ------ | --------------------------------------------- | ------------------- | --------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 51  | GET    | `/api/v2/notifications`                       | Get Notifications   | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                    | Get user notifications                 |
| 52  | PUT    | `/api/v2/notifications/{notificationId}/read` | Mark as Read        | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                    | Mark notification as read              |
| 53  | PUT    | `/api/v2/notifications/read-all`              | Mark All Read       | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                    | Mark all notifications as read         |
| 54  | DELETE | `/api/v2/notifications/{notificationId}`      | Delete Notification | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                    | Delete notification                    |
| 55  | GET    | `/api/v2/notifications/count`                 | Get Count           | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                    | Get unread notification count          |
| 56  | POST   | `/api/v2/notifications/devices`               | Register Device     | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"deviceToken": "device_token_here", "platform": "ios", "deviceInfo": {"model": "iPhone 12", "osVersion": "15.0"}}` | Register device for push notifications |
| 57  | PUT    | `/api/v2/notifications/devices/{deviceId}`    | Update Device       | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"deviceToken": "new_device_token_here"}`                                                                           | Update device token                    |
| 58  | DELETE | `/api/v2/notifications/devices/{deviceId}`    | Unregister Device   | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                    | Unregister device                      |

---

## 👑 Admin & Moderation

| #   | Method | URL                                               | Endpoint Name    | Headers Required                                                          | Body Data Type | Body Data                                                                                                                                                                   | Summary                       |
| --- | ------ | ------------------------------------------------- | ---------------- | ------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 59  | GET    | `/api/v2/admin/users`                             | Get All Users    | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                           | Get all users (admin only)    |
| 60  | GET    | `/api/v2/admin/users/{userId}`                    | Get User Details | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                           | Get user details (admin only) |
| 61  | PUT    | `/api/v2/admin/users/{userId}`                    | Update User      | Authorization: Bearer {adminToken}<br>Content-Type: application/json      | JSON           | `{"status": "suspended", "role": "moderator", "reason": "Policy violation", "notes": "Internal admin notes"}`                                                               | Update user (admin only)      |
| 62  | POST   | `/api/v2/admin/users/{userId}/suspend`            | Suspend User     | Authorization: Bearer {adminToken}<br>Content-Type: application/json      | JSON           | `{"reason": "Spam behavior", "duration": "7d", "notifyUser": true}`                                                                                                         | Suspend user                  |
| 63  | POST   | `/api/v2/admin/users/{userId}/ban`                | Ban User         | Authorization: Bearer {adminToken}<br>Content-Type: application/json      | JSON           | `{"reason": "Severe policy violation", "permanent": true, "deleteContent": false}`                                                                                          | Ban user                      |
| 64  | POST   | `/api/v2/admin/users/{userId}/unban`              | Unban User       | Authorization: Bearer {adminToken}<br>Content-Type: application/json      | JSON           | `{"reason": "Appeal approved"}`                                                                                                                                             | Unban user                    |
| 65  | GET    | `/api/v2/admin/reports`                           | Get Reports      | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                           | Get reported content          |
| 66  | PUT    | `/api/v2/admin/reports/{reportId}`                | Review Report    | Authorization: Bearer {adminToken}<br>Content-Type: application/json      | JSON           | `{"action": "approve", "reason": "Content violates guidelines", "moderatorNotes": "Inappropriate language detected"}`                                                       | Review report                 |
| 67  | DELETE | `/api/v2/admin/content/{contentType}/{contentId}` | Delete Content   | Authorization: Bearer {adminToken}<br>Content-Type: application/json      | JSON           | `{"reason": "Policy violation", "notifyUser": true}`                                                                                                                        | Delete content                |
| 68  | GET    | `/api/v2/admin/dashboard`                         | Admin Dashboard  | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                           | Get admin dashboard           |
| 69  | GET    | `/api/v2/admin/stats`                             | System Stats     | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                           | Get system stats              |
| 70  | GET    | `/api/v2/admin/audit-logs`                        | Audit Logs       | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                           | Get audit logs                |
| 71  | POST   | `/api/v2/admin/create-admin`                      | Create Admin     | Authorization: Bearer {superAdminToken}<br>Content-Type: application/json | JSON           | `{"username": "newadmin", "email": "admin@endlesschatt.com", "password": "SecureAdminPass123!", "role": "admin", "permissions": ["user_management", "content_moderation"]}` | Create admin user             |

---

## 📊 Analytics & Insights

| #   | Method | URL                                  | Endpoint Name     | Headers Required                   | Body Data Type | Body Data | Summary                     |
| --- | ------ | ------------------------------------ | ----------------- | ---------------------------------- | -------------- | --------- | --------------------------- |
| 72  | GET    | `/api/v2/analytics/users/engagement` | User Engagement   | Authorization: Bearer {adminToken} | -              | -         | Get user engagement stats   |
| 73  | GET    | `/api/v2/analytics/platform/stats`   | Platform Stats    | Authorization: Bearer {adminToken} | -              | -         | Get platform statistics     |
| 74  | GET    | `/api/v2/analytics/messages/stats`   | Message Stats     | Authorization: Bearer {adminToken} | -              | -         | Get message statistics      |
| 75  | GET    | `/api/v2/analytics/users/growth`     | User Growth       | Authorization: Bearer {adminToken} | -              | -         | Get user growth analytics   |
| 76  | GET    | `/api/v2/analytics/revenue`          | Revenue Analytics | Authorization: Bearer {adminToken} | -              | -         | Get revenue analytics       |
| 77  | GET    | `/api/v2/analytics/features/usage`   | Feature Usage     | Authorization: Bearer {adminToken} | -              | -         | Get feature usage analytics |
| 78  | GET    | `/api/v2/analytics/export`           | Export Analytics  | Authorization: Bearer {adminToken} | -              | -         | Export analytics data       |

---

## ⚙️ System & Configuration

| #   | Method | URL                     | Endpoint Name  | Headers Required                                                          | Body Data Type | Body Data                                                                                                                                                                       | Summary                  |
| --- | ------ | ----------------------- | -------------- | ------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 79  | GET    | `/health`               | Health Check   | -                                                                         | -              | -                                                                                                                                                                               | Basic health check       |
| 80  | GET    | `/api/v2/status`        | API Status     | -                                                                         | -              | -                                                                                                                                                                               | API status check         |
| 81  | GET    | `/api/v2/system/health` | Service Health | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                               | Service health check     |
| 82  | GET    | `/api/v2/system/config` | Get Config     | Authorization: Bearer {adminToken}                                        | -              | -                                                                                                                                                                               | Get app configuration    |
| 83  | PUT    | `/api/v2/system/config` | Update Config  | Authorization: Bearer {superAdminToken}<br>Content-Type: application/json | JSON           | `{"features": {"chatEnabled": true, "fileUploadEnabled": true, "maxFileSize": "10MB"}, "limits": {"maxGroupMembers": 100, "maxMessageLength": 4000, "rateLimitPerMinute": 60}}` | Update app configuration |

---

## 🔍 Search & Discovery

| #   | Method | URL                       | Endpoint Name     | Headers Required                    | Body Data Type | Body Data | Summary           |
| --- | ------ | ------------------------- | ----------------- | ----------------------------------- | -------------- | --------- | ----------------- |
| 84  | GET    | `/api/v2/search`          | Search Everything | Authorization: Bearer {accessToken} | -              | -         | Search everything |
| 85  | GET    | `/api/v2/search/users`    | Search Users      | Authorization: Bearer {accessToken} | -              | -         | Search users      |
| 86  | GET    | `/api/v2/search/messages` | Search Messages   | Authorization: Bearer {accessToken} | -              | -         | Search messages   |
| 87  | GET    | `/api/v2/search/groups`   | Search Groups     | Authorization: Bearer {accessToken} | -              | -         | Search groups     |

---

## 🌐 Social Features

| #   | Method | URL                                                  | Endpoint Name         | Headers Required                                                      | Body Data Type | Body Data                                                                                                                           | Summary               |
| --- | ------ | ---------------------------------------------------- | --------------------- | --------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 88  | POST   | `/api/v2/social/friends/request`                     | Send Friend Request   | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"userId": "user123", "message": "Hi! I'd like to connect with you."}`                                                             | Send friend request   |
| 89  | PUT    | `/api/v2/social/friends/requests/{requestId}/accept` | Accept Friend Request | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Accept friend request |
| 90  | PUT    | `/api/v2/social/friends/requests/{requestId}/reject` | Reject Friend Request | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Reject friend request |
| 91  | GET    | `/api/v2/social/friends/requests`                    | Get Friend Requests   | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Get friend requests   |
| 92  | GET    | `/api/v2/social/friends`                             | Get Friends List      | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Get friends list      |
| 93  | DELETE | `/api/v2/social/friends/{userId}`                    | Remove Friend         | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Remove friend         |
| 94  | POST   | `/api/v2/social/block`                               | Block User            | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"userId": "user123", "reason": "Harassment"}`                                                                                     | Block user            |
| 95  | DELETE | `/api/v2/social/block/{userId}`                      | Unblock User          | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Unblock user          |
| 96  | GET    | `/api/v2/social/blocked`                             | Get Blocked Users     | Authorization: Bearer {accessToken}                                   | -              | -                                                                                                                                   | Get blocked users     |
| 97  | POST   | `/api/v2/social/reports/user`                        | Report User           | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"userId": "user123", "reason": "spam", "description": "User is sending spam messages", "evidence": ["messageId1", "messageId2"]}` | Report user           |
| 98  | POST   | `/api/v2/social/reports/message`                     | Report Message        | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"messageId": "msg123", "reason": "inappropriate_content", "description": "Message contains offensive language"}`                  | Report message        |
| 99  | POST   | `/api/v2/social/reports/group`                       | Report Group          | Authorization: Bearer {accessToken}<br>Content-Type: application/json | JSON           | `{"groupId": "group123", "reason": "inappropriate_content", "description": "Group is sharing inappropriate content"}`               | Report group          |

---

## 📋 API Information

**Total Endpoints:** 99

**Authentication Types:**

- Bearer Token (accessToken)
- Bearer Token (refreshToken)
- Bearer Token (adminToken)
- Bearer Token (superAdminToken)

**Body Data Types:**

- JSON (application/json)
- Form Data (multipart/form-data)

**Rate Limits:**

- Authentication: 5 requests/minute
- Messaging: 60 requests/minute
- File Upload: 10 requests/minute
- Search: 30 requests/minute
- General API: 100 requests/minute
- Admin API: 200 requests/minute

---

## 📊 Rate Limiting

### Rate Limit Information

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
X-RateLimit-Window: 60
```

### Rate Limits by Endpoint Type

| Endpoint Type      | Limit        | Window   |
| ------------------ | ------------ | -------- |
| **Authentication** | 5 requests   | 1 minute |
| **Messaging**      | 60 requests  | 1 minute |
| **File Upload**    | 10 requests  | 1 minute |
| **Search**         | 30 requests  | 1 minute |
| **General API**    | 100 requests | 1 minute |
| **Admin API**      | 200 requests | 1 minute |

---

## 🧪 Testing with Postman

### Environment Variables

```json
{
  "baseUrl": "http://localhost:5000/api/v2",
  "accessToken": "{{your_access_token}}",
  "refreshToken": "{{your_refresh_token}}",
  "adminToken": "{{your_admin_token}}",
  "userId": "{{test_user_id}}",
  "conversationId": "{{test_conversation_id}}",
  "messageId": "{{test_message_id}}"
}
```

### Pre-request Scripts

```javascript
// Auto-refresh token if expired
if (pm.globals.get("tokenExpiry") < Date.now()) {
  // Refresh token logic
}

// Add request ID
pm.request.headers.add({
  key: "X-Request-ID",
  value: pm.globals.replaceIn("{{$randomUUID}}"),
});
```

---

## 📈 API Versioning

### Version Strategy

- **Current Version**: v2.0.0
- **Supported Versions**: v1.x (deprecated), v2.x (current)
- **Version Header**: `X-API-Version: v2`
- **URL Versioning**: `/api/v2/`

### Migration Guide

- v1 → v2: [Migration Guide](./migration-v1-to-v2.md)
- Breaking changes documented in [CHANGELOG.md](../CHANGELOG.md)

---

**Total Endpoints: 99**

_EndlessChatt API - Powering seamless social connections worldwide._

**Built with ❤️ by [Deepansh Gangwar](https://github.com/mr-deepansh)**
