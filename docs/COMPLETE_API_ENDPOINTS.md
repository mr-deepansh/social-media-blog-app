# 🚀 Complete API Endpoints for Postman Testing

**Base URL:** `http://localhost:5000/api/v1`

---

## 📋 Table of Contents

1. [🔐 Authentication & Password Management](#-authentication--password-management)
2. [👤 User Management](#-user-management)
3. [📝 Blog Management](#-blog-management)
4. [🛡️ Admin Routes](#️-admin-routes)
5. [👑 Super Admin Routes](#-super-admin-routes)
6. [📊 Analytics & Monitoring](#-analytics--monitoring)
7. [🔒 Security & Moderation](#-security--moderation)
8. [⚙️ System Configuration](#️-system-configuration)
9. [📢 Notifications](#-notifications)
10. [🔄 Automation & Workflows](#-automation--workflows)
11. [🌟 Business Intelligence](#-business-intelligence)

---

## 🔐 Authentication & Password Management

### 1. User Registration

- **URL:** `POST /api/v1/users/register`
- **Folder:** Authentication
- **Body:**

```json
{
	"username": "testuser",
	"email": "test@example.com",
	"password": "Strong@123",
	"confirmPassword": "Strong@123",
	"firstName": "Test",
	"lastName": "User"
}
```

### 2. User Login

- **URL:** `POST /api/v1/users/login`
- **Folder:** Authentication
- **Body:**

```json
{
	"identifier": "test@example.com",
	"password": "Strong@123",
	"rememberMe": false
}
```

### 3. User Logout

- **URL:** `POST /api/v1/users/logout`
- **Folder:** Authentication
- **Auth:** Bearer Token Required
- **Body:** Empty

### 4. Refresh Access Token

- **URL:** `POST /api/v1/users/refresh-token`
- **Folder:** Authentication
- **Body:**

```json
{
	"refreshToken": "your_refresh_token_here"
}
```

### 5. Forgot Password

- **URL:** `POST /api/v1/auth/forgot-password`
- **Folder:** Authentication
- **Body:**

```json
{
	"email": "test@example.com"
}
```

### 6. Reset Password

- **URL:** `POST /api/v1/auth/reset-password/:token`
- **Folder:** Authentication
- **Body:**

```json
{
	"password": "NewStrong@123",
	"confirmPassword": "NewStrong@123"
}
```

### 7. Verify Email

- **URL:** `POST /api/v1/auth/verify-email/:token`
- **Folder:** Authentication
- **Body:** Empty

### 8. Resend Email Verification

- **URL:** `POST /api/v1/auth/resend-verification`
- **Folder:** Authentication
- **Auth:** Bearer Token Required
- **Body:** Empty

### 9. Get Security Overview

- **URL:** `GET /api/v1/auth/security-overview`
- **Folder:** Authentication
- **Auth:** Bearer Token Required

### 10. Get User Activity

- **URL:** `GET /api/v1/auth/activity`
- **Folder:** Authentication
- **Auth:** Bearer Token Required
- **Query Params:** `?page=1&limit=20&type=login`

### 11. Get Activity Stats

- **URL:** `GET /api/v1/auth/activity/stats`
- **Folder:** Authentication
- **Auth:** Bearer Token Required

### 12. Get Login Locations

- **URL:** `GET /api/v1/auth/activity/locations`
- **Folder:** Authentication
- **Auth:** Bearer Token Required

---

## 👤 User Management

### 13. Get Current User Profile

- **URL:** `GET /api/v1/users/profile`
- **Folder:** User Management
- **Auth:** Bearer Token Required

### 14. Get Current User Profile (Alternative)

- **URL:** `GET /api/v1/users/profile/me`
- **Folder:** User Management
- **Auth:** Bearer Token Required

### 15. Update Current User Profile

- **URL:** `PUT /api/v1/users/profile`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:**

```json
{
	"firstName": "Updated",
	"lastName": "Name",
	"bio": "Updated bio",
	"avatar": "https://example.com/avatar.jpg"
}
```

### 16. Update Current User Profile (Alternative)

- **URL:** `PUT /api/v1/users/profile/me`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:** Same as above

### 17. Change Password

- **URL:** `POST /api/v1/users/change-password`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:**

```json
{
	"currentPassword": "Strong@123",
	"newPassword": "NewStrong@123"
}
```

### 18. Upload Avatar

- **URL:** `POST /api/v1/users/upload-avatar`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:**

```json
{
	"avatarUrl": "https://example.com/avatar.jpg"
}
```

### 19. Get All Users (with pagination)

- **URL:** `GET /api/v1/users`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Query Params:** `?page=1&limit=10&search=test&role=user&isActive=true&sortBy=createdAt&sortOrder=desc`

### 20. Get User by ID

- **URL:** `GET /api/v1/users/:id`
- **Folder:** User Management
- **Auth:** Bearer Token Required

### 21. Update User by ID

- **URL:** `PUT /api/v1/users/:id`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:**

```json
{
	"firstName": "Updated",
	"lastName": "Name",
	"bio": "Updated bio"
}
```

### 22. Delete User by ID

- **URL:** `DELETE /api/v1/users/:id`
- **Folder:** User Management
- **Auth:** Bearer Token Required

### 23. Get User Profile by Username

- **URL:** `GET /api/v1/users/profile/:username`
- **Folder:** User Management
- **Auth:** Bearer Token Required

### 24. Search Users

- **URL:** `GET /api/v1/users/search`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Query Params:** `?username=test&page=1&limit=10`

### 25. Get User Feed

- **URL:** `GET /api/v1/users/feed`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Query Params:** `?page=1&limit=20&sort=recent`

### 26. Follow User

- **URL:** `POST /api/v1/users/follow/:userId`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:** Empty

### 27. Unfollow User

- **URL:** `POST /api/v1/users/unfollow/:userId`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Body:** Empty

### 28. Get User Followers

- **URL:** `GET /api/v1/users/followers/:userId`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Query Params:** `?page=1&limit=50`

### 29. Get User Following

- **URL:** `GET /api/v1/users/following/:userId`
- **Folder:** User Management
- **Auth:** Bearer Token Required
- **Query Params:** `?page=1&limit=50`

---

## 📝 Blog Management

### 30. Get All Blogs (Public)

- **URL:** `GET /api/v1/blogs`
- **Folder:** Blog Management
- **Query Params:** `?page=1&limit=10&sortBy=createdAt&sortOrder=desc`

### 31. Get Blog by ID (Public)

- **URL:** `GET /api/v1/blogs/:id`
- **Folder:** Blog Management

### 32. Create Blog

- **URL:** `POST /api/v1/blogs`
- **Folder:** Blog Management
- **Auth:** Bearer Token Required
- **Body:**

```json
{
	"title": "My First Blog",
	"content": "This is the content of my blog post...",
	"tags": ["technology", "programming", "nodejs"]
}
```

### 33. Update Blog

- **URL:** `PATCH /api/v1/blogs/:id`
- **Folder:** Blog Management
- **Auth:** Bearer Token Required
- **Body:**

```json
{
	"title": "Updated Blog Title",
	"content": "Updated content...",
	"tags": ["updated", "tags"]
}
```

### 34. Delete Blog

- **URL:** `DELETE /api/v1/blogs/:id`
- **Folder:** Blog Management
- **Auth:** Bearer Token Required

---

## 🛡️ Admin Routes

### 35. Create Super Admin (One-time setup)

- **URL:** `POST /api/v1/admin/create-super-admin`
- **Folder:** Admin Routes
- **Body:**

```json
{
	"username": "superadmin",
	"email": "superadmin@example.com",
	"password": "SuperAdmin@123",
	"confirmPassword": "SuperAdmin@123",
	"firstName": "Super",
	"lastName": "Admin"
}
```

### 36. Get Admin Dashboard

- **URL:** `GET /api/v1/admin/dashboard`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 37. Get Admin Stats

- **URL:** `GET /api/v1/admin/stats`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 38. Get Admin Stats Live

- **URL:** `GET /api/v1/admin/stats/live`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 39. Get All Admins

- **URL:** `GET /api/v1/admin/admins`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 40. Get Admin by ID

- **URL:** `GET /api/v1/admin/admins/:adminId`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 41. Get All Users (Admin)

- **URL:** `GET /api/v1/admin/users`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?page=1&limit=20&role=user&isActive=true`

### 42. Get User by ID (Admin)

- **URL:** `GET /api/v1/admin/users/:id`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 43. Update User by ID (Admin)

- **URL:** `PUT /api/v1/admin/users/:id`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"firstName": "Updated",
	"lastName": "Name",
	"isActive": true
}
```

### 44. Delete User by ID (Admin)

- **URL:** `DELETE /api/v1/admin/users/:id`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 45. Suspend User

- **URL:** `PATCH /api/v1/admin/users/:id/suspend`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"reason": "Policy violation"
}
```

### 46. Activate User

- **URL:** `PATCH /api/v1/admin/users/:id/activate`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:** Empty

### 47. Verify User Account

- **URL:** `PATCH /api/v1/admin/users/:id/verify`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:** Empty

### 48. Search Users (Admin)

- **URL:** `GET /api/v1/admin/users/search`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?query=test&page=1&limit=20&role=user`

### 49. Bulk Export Users

- **URL:** `GET /api/v1/admin/users/export`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?format=csv&filters=active`

### 50. Bulk Actions on Users

- **URL:** `POST /api/v1/admin/users/bulk-actions`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"action": "suspend",
	"userIds": ["user1", "user2", "user3"],
	"reason": "Policy violation",
	"notifyUsers": true
}
```

### 51. Get User Activity Log

- **URL:** `GET /api/v1/admin/users/:id/activity-log`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?page=1&limit=50&type=login`

### 52. Send Notification to User

- **URL:** `POST /api/v1/admin/users/:id/notify`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"type": "warning",
	"title": "Account Warning",
	"message": "Please review our community guidelines",
	"channels": ["email", "in-app"]
}
```

### 53. Force Password Reset

- **URL:** `POST /api/v1/admin/users/:id/force-password-reset`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"reason": "Security concern"
}
```

### 54. Get User Security Analysis

- **URL:** `GET /api/v1/admin/users/:id/security-analysis`
- **Folder:** Admin Routes
- **Auth:** Bearer Token Required (Admin/Super Admin)

---

## 👑 Super Admin Routes

### 55. Create Admin

- **URL:** `POST /api/v1/admin/super-admin/create-admin`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)
- **Body:**

```json
{
	"username": "newadmin",
	"email": "admin@company.com",
	"password": "Strong@123!",
	"role": "admin",
	"permissions": ["user_management", "content_moderation"]
}
```

### 56. Get All Admins (Super Admin)

- **URL:** `GET /api/v1/admin/super-admin/admins`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)

### 57. Update Admin

- **URL:** `PUT /api/v1/admin/super-admin/update-admin/:adminId`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)
- **Body:**

```json
{
	"permissions": ["user_management", "content_moderation", "analytics"],
	"isActive": true
}
```

### 58. Delete Admin

- **URL:** `DELETE /api/v1/admin/super-admin/delete-admin/:adminId`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)
- **Body:**

```json
{
	"confirmPassword": "SuperAdmin@123",
	"reason": "Admin role no longer required"
}
```

### 59. Change User Role

- **URL:** `PUT /api/v1/admin/super-admin/change-role/:userId`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)
- **Body:**

```json
{
	"newRole": "admin",
	"reason": "Promoting user to admin for content management responsibilities"
}
```

### 60. Get System Configuration

- **URL:** `GET /api/v1/admin/super-admin/system-config`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)

### 61. Get Audit Logs

- **URL:** `GET /api/v1/admin/super-admin/audit-logs`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)
- **Query Params:** `?page=1&limit=50&action=CREATE_ADMIN&criticality=HIGH`

### 62. Get System Health (Super Admin)

- **URL:** `GET /api/v1/admin/super-admin/system-health`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)

### 63. Emergency Lockdown

- **URL:** `POST /api/v1/admin/super-admin/emergency-lockdown`
- **Folder:** Super Admin Routes
- **Auth:** Bearer Token Required (Super Admin Only)
- **Body:**

```json
{
	"reason": "Security breach detected",
	"duration": "1h",
	"confirmPassword": "SuperAdmin@123"
}
```

---

## 📊 Analytics & Monitoring

### 64. Get Session Analytics

- **URL:** `GET /api/v1/admin/sessions/analytics`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?timeRange=30d`

### 65. Get Admin Session Details

- **URL:** `GET /api/v1/admin/sessions/:adminId`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 66. Get Analytics Overview

- **URL:** `GET /api/v1/admin/analytics/overview`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?timeRange=30d`

### 67. Get User Growth Analytics

- **URL:** `GET /api/v1/admin/analytics/users/growth`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?period=daily&days=30`

### 68. Get User Retention Analytics

- **URL:** `GET /api/v1/admin/analytics/users/retention`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?period=weekly&weeks=12`

### 69. Get User Demographics

- **URL:** `GET /api/v1/admin/analytics/users/demographics`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 70. Get Engagement Metrics

- **URL:** `GET /api/v1/admin/analytics/engagement/metrics`
- **Folder:** Analytics & Monitoring
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?timeRange=30d&metric=all`

---

## 🔒 Security & Moderation

### 71. Get Suspicious Accounts

- **URL:** `GET /api/v1/admin/security/suspicious-accounts`
- **Folder:** Security & Moderation
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?page=1&limit=20&riskLevel=high`

### 72. Get Login Attempts

- **URL:** `GET /api/v1/admin/security/login-attempts`
- **Folder:** Security & Moderation
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?status=failed&timeRange=24h`

### 73. Get Blocked IPs

- **URL:** `GET /api/v1/admin/security/blocked-ips`
- **Folder:** Security & Moderation
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?page=1&limit=20`

### 74. Block IP Address

- **URL:** `POST /api/v1/admin/security/blocked-ips`
- **Folder:** Security & Moderation
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"ipAddress": "192.168.1.100",
	"reason": "Multiple failed login attempts",
	"duration": "24h"
}
```

### 75. Unblock IP Address

- **URL:** `DELETE /api/v1/admin/security/blocked-ips/:ipId`
- **Folder:** Security & Moderation
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"reason": "Issue resolved"
}
```

### 76. Get Threat Detection

- **URL:** `GET /api/v1/admin/security/threat-detection`
- **Folder:** Security & Moderation
- **Auth:** Bearer Token Required (Admin/Super Admin)

---

## ⚙️ System Configuration

### 77. Get App Settings

- **URL:** `GET /api/v1/admin/config/app-settings`
- **Folder:** System Configuration
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 78. Update App Settings

- **URL:** `PUT /api/v1/admin/config/app-settings`
- **Folder:** System Configuration
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"category": "security",
	"settings": {
		"maxLoginAttempts": 5,
		"lockoutDuration": 1800
	}
}
```

### 79. Get Server Health

- **URL:** `GET /api/v1/admin/monitoring/server-health`
- **Folder:** System Configuration
- **Auth:** Bearer Token Required (Admin/Super Admin)

### 80. Get Database Stats

- **URL:** `GET /api/v1/admin/monitoring/database-stats`
- **Folder:** System Configuration
- **Auth:** Bearer Token Required (Admin/Super Admin)

---

## 📢 Notifications

### 81. Get Notification Templates

- **URL:** `GET /api/v1/admin/notifications/templates`
- **Folder:** Notifications
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?type=email`

### 82. Send Bulk Notification

- **URL:** `POST /api/v1/admin/notifications/send-bulk`
- **Folder:** Notifications
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"recipients": "active",
	"template": "system_update",
	"channels": ["email", "in-app"],
	"priority": "normal",
	"customMessage": {
		"title": "System Maintenance",
		"content": "Scheduled maintenance on Sunday 2AM-4AM UTC"
	}
}
```

---

## 🔄 Automation & Workflows

### 83. Get Automation Rules

- **URL:** `GET /api/v1/admin/automation/rules`
- **Folder:** Automation & Workflows
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?status=active`

### 84. Create Automation Rule

- **URL:** `POST /api/v1/admin/automation/rules`
- **Folder:** Automation & Workflows
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"name": "Welcome New Users",
	"description": "Send welcome email to new registrations",
	"trigger": "user_created",
	"conditions": {
		"isEmailVerified": true
	},
	"actions": [
		{
			"type": "send_email",
			"template": "welcome",
			"delay": 0
		}
	]
}
```

### 85. Get Experiments

- **URL:** `GET /api/v1/admin/experiments`
- **Folder:** Automation & Workflows
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?status=running`

### 86. Create Experiment

- **URL:** `POST /api/v1/admin/experiments`
- **Folder:** Automation & Workflows
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"name": "New Onboarding Flow",
	"description": "Testing simplified onboarding process",
	"variants": [
		{
			"name": "control",
			"description": "Current flow"
		},
		{
			"name": "simplified",
			"description": "New simplified flow"
		}
	],
	"trafficSplit": [50, 50],
	"duration": 14
}
```

---

## 🌟 Business Intelligence

### 87. Get Revenue Analytics

- **URL:** `GET /api/v1/admin/bi/revenue-analytics`
- **Folder:** Business Intelligence
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?period=30d`

### 88. Get User Lifetime Value

- **URL:** `GET /api/v1/admin/bi/user-lifetime-value`
- **Folder:** Business Intelligence
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?segment=premium`

---

## 🚨 Content Management

### 89. Get All Posts (Admin)

- **URL:** `GET /api/v1/admin/content/posts`
- **Folder:** Content Management
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Query Params:** `?page=1&limit=20&status=published`

### 90. Toggle Post Visibility

- **URL:** `PATCH /api/v1/admin/content/posts/:postId/toggle-visibility`
- **Folder:** Content Management
- **Auth:** Bearer Token Required (Admin/Super Admin)
- **Body:**

```json
{
	"action": "hide",
	"reason": "Inappropriate content"
}
```

---

## 🔍 Health Check & System

### 91. Health Check

- **URL:** `GET /health`
- **Folder:** System
- **Description:** Basic health check endpoint

### 92. API Version Check

- **URL:** `GET /api/v1`
- **Folder:** System
- **Description:** API version and status check

---

## 📝 Environment Variables for Postman

Create these variables in your Postman environment:

```
server: http://localhost:5000/api/v1
token: {{your_jwt_token_here}}
adminToken: {{your_admin_jwt_token_here}}
superAdminToken: {{your_super_admin_jwt_token_here}}
userId: {{test_user_id}}
adminId: {{test_admin_id}}
blogId: {{test_blog_id}}
postId: {{test_post_id}}
ipId: {{test_ip_id}}
```

---

## 🔐 Authentication Headers

For protected routes, add this header:

```
Authorization: Bearer {{token}}
```

For admin routes, use:

```
Authorization: Bearer {{adminToken}}
```

For super admin routes, use:

```
Authorization: Bearer {{superAdminToken}}
```

---

## 📊 Response Format

All API responses follow this standard format:

```json
{
	"statusCode": 200,
	"data": {
		// Response data here
	},
	"message": "Operation successful",
	"success": true,
	"timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🚀 Testing Order Recommendation

1. **Start with Authentication:**
   - Create Super Admin (#35)
   - Register User (#1)
   - Login User (#2)

2. **Test User Management:**
   - Get Current Profile (#13)
   - Update Profile (#15)
   - Change Password (#17)

3. **Test Blog Management:**
   - Create Blog (#32)
   - Get All Blogs (#30)
   - Update Blog (#33)

4. **Test Admin Features:**
   - Get Admin Dashboard (#36)
   - Get Admin Stats (#37)
   - User Management (#41-54)

5. **Test Advanced Features:**
   - Analytics (#64-70)
   - Security (#71-76)
   - System Configuration (#77-80)

---

## 📋 Notes

- Replace `:id`, `:userId`, `:adminId`, etc. with actual IDs
- Some endpoints require specific roles (admin/super_admin)
- Query parameters are optional unless specified
- All timestamps are in ISO 8601 format
- File uploads use multipart/form-data (where applicable)
- Rate limiting applies to most endpoints
- CORS is enabled for all origins in development

---

**Total Endpoints: 92**

This comprehensive list covers all available API endpoints in your social media blog application. Use this as your complete reference for Postman testing!
