# 🚀 Production-Grade Admin Panel API Reference

## 📋 Table of Contents

- [Authentication](#authentication)
- [Dashboard & Analytics](#dashboard--analytics)
- [Security & Moderation](#security--moderation)
- [Content Management](#content-management)
- [System Configuration](#system-configuration)
- [Communication & Notifications](#communication--notifications)
- [Performance Monitoring](#performance-monitoring)
- [Automation & Workflows](#automation--workflows)
- [A/B Testing & Experiments](#ab-testing--experiments)
- [Enterprise Features](#enterprise-features)
- [User Management](#user-management)
- [Error Codes](#error-codes)

---

## 🔐 Authentication

All admin endpoints require JWT authentication and admin role.

**Headers Required:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📊 Dashboard & Analytics

### Basic Stats

#### Get Admin Dashboard Stats

```http
GET /api/v1/admin/stats
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"stats": {
			"overview": {
				"totalUsers": 15420,
				"activeUsers": 12340,
				"adminUsers": 25,
				"suspendedUsers": 3080,
				"activePercentage": "80.0%",
				"currentMonthSignups": 1250,
				"userGrowthTrend": "up",
				"healthScore": 85
			},
			"breakdown": {
				"usersByRole": {
					"user": 15395,
					"admin": 20,
					"super_admin": 5
				},
				"usersByLocation": {
					"United States": 5420,
					"India": 3240,
					"United Kingdom": 2180
				}
			}
		}
	},
	"message": "Admin stats fetched successfully",
	"success": true
}
```

#### Get Live Stats

```http
GET /api/v1/admin/stats/live
```

### Advanced Analytics

#### Get Analytics Overview

```http
GET /api/v1/admin/analytics/overview?timeRange=30d
```

#### Get User Growth Analytics

```http
GET /api/v1/admin/analytics/users/growth?period=daily&days=30
```

#### Get User Retention Analytics

```http
GET /api/v1/admin/analytics/users/retention?cohortPeriod=monthly
```

#### Get User Demographics

```http
GET /api/v1/admin/analytics/users/demographics
```

#### Get Engagement Metrics

```http
GET /api/v1/admin/analytics/engagement/metrics?timeRange=7d
```

---

## 🛡️ Security & Moderation

### Security Monitoring

#### Get Suspicious Accounts

```http
GET /api/v1/admin/security/suspicious-accounts?page=1&limit=20&riskLevel=high
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"accounts": [
			{
				"_id": "user_id",
				"email": "suspicious@example.com",
				"username": "suspicious_user",
				"riskScore": 45,
				"lastLoginAt": "2024-01-01T00:00:00.000Z",
				"isEmailVerified": false,
				"loginAttempts": 8
			}
		],
		"summary": {
			"highRisk": 5,
			"mediumRisk": 12,
			"lowRisk": 3
		}
	}
}
```

#### Get Login Attempts

```http
GET /api/v1/admin/security/login-attempts?status=failed&timeRange=24h
```

#### Block IP Address

```http
POST /api/v1/admin/security/blocked-ips
```

**Request Body:**

```json
{
	"ipAddress": "192.168.1.100",
	"reason": "Multiple failed login attempts",
	"duration": "permanent"
}
```

#### Get Blocked IPs

```http
GET /api/v1/admin/security/blocked-ips?page=1&limit=20
```

#### Get Threat Detection

```http
GET /api/v1/admin/security/threat-detection
```

---

## 🚨 Content Management

### Posts Management

#### Get All Posts (Admin View)

```http
GET /api/v1/admin/content/posts?page=1&limit=20&status=published&sortBy=createdAt
```

#### Toggle Post Visibility

```http
PATCH /api/v1/admin/content/posts/:postId/toggle-visibility
```

**Request Body:**

```json
{
	"action": "hide",
	"reason": "Inappropriate content"
}
```

---

## 🎛️ System Configuration

### App Settings

#### Get App Settings

```http
GET /api/v1/admin/config/app-settings
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"general": {
			"appName": "Social Media Blog",
			"appVersion": "1.0.0",
			"maintenanceMode": false,
			"registrationEnabled": true
		},
		"security": {
			"maxLoginAttempts": 5,
			"lockoutDuration": 15,
			"passwordMinLength": 8
		},
		"features": {
			"socialLogin": true,
			"fileUpload": true,
			"notifications": true
		}
	}
}
```

#### Update App Settings

```http
PUT /api/v1/admin/config/app-settings
```

**Request Body:**

```json
{
	"category": "security",
	"settings": {
		"maxLoginAttempts": 3,
		"lockoutDuration": 30
	}
}
```

---

## 📢 Communication & Notifications

### Notification Management

#### Get Notification Templates

```http
GET /api/v1/admin/notifications/templates?type=email
```

#### Send Bulk Notification

```http
POST /api/v1/admin/notifications/send-bulk
```

**Request Body:**

```json
{
	"recipients": "active",
	"template": "welcome",
	"channels": ["email", "in-app"],
	"priority": "normal",
	"customMessage": {
		"title": "Important Update",
		"content": "We have updated our terms of service."
	}
}
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"notificationId": "bulk_1704067200000_admin123",
		"summary": {
			"totalRecipients": 12340,
			"processed": 12340,
			"successful": 12280,
			"failed": 60,
			"successRate": "99.51%"
		}
	}
}
```

---

## 📈 Performance Monitoring

### System Health

#### Get Server Health

```http
GET /api/v1/admin/monitoring/server-health
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"status": "healthy",
		"timestamp": "2024-01-01T12:00:00.000Z",
		"uptime": 86400,
		"memory": {
			"used": 256,
			"total": 512,
			"percentage": 50
		},
		"database": {
			"status": "connected",
			"collections": 8,
			"dataSize": 1024
		},
		"responseTime": 45.67
	}
}
```

#### Get Database Stats

```http
GET /api/v1/admin/monitoring/database-stats
```

---

## 🔄 Automation & Workflows

### Automation Rules

#### Get Automation Rules

```http
GET /api/v1/admin/automation/rules
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"rules": [
			{
				"id": "auto_suspend_inactive",
				"name": "Auto Suspend Inactive Users",
				"description": "Suspend users inactive for 90+ days",
				"trigger": "schedule",
				"schedule": "0 2 * * 0",
				"isActive": true,
				"lastRun": "2024-01-01T02:00:00.000Z",
				"nextRun": "2024-01-08T02:00:00.000Z"
			}
		]
	}
}
```

#### Create Automation Rule

```http
POST /api/v1/admin/automation/rules
```

**Request Body:**

```json
{
	"name": "Welcome New Users",
	"description": "Send welcome email to new registrations",
	"trigger": "user_created",
	"conditions": {
		"isEmailVerified": true
	},
	"actions": ["send_welcome_email"],
	"schedule": null
}
```

---

## 🎯 A/B Testing & Experiments

### Experiments

#### Get Experiments

```http
GET /api/v1/admin/experiments?status=running
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"experiments": [
			{
				"id": "exp_new_ui",
				"name": "New Dashboard UI",
				"status": "running",
				"startDate": "2024-01-01T00:00:00.000Z",
				"endDate": "2024-01-15T00:00:00.000Z",
				"variants": [
					{
						"name": "control",
						"traffic": 50,
						"conversions": 120,
						"participants": 1000
					},
					{
						"name": "variant_a",
						"traffic": 50,
						"conversions": 145,
						"participants": 1000
					}
				],
				"metrics": {
					"conversionRate": {
						"control": "12.0%",
						"variant_a": "14.5%",
						"improvement": "+2.5%"
					}
				}
			}
		]
	}
}
```

#### Create Experiment

```http
POST /api/v1/admin/experiments
```

**Request Body:**

```json
{
	"name": "New Onboarding Flow",
	"description": "Testing simplified onboarding process",
	"variants": [
		{ "name": "control", "description": "Current flow" },
		{ "name": "simplified", "description": "New simplified flow" }
	],
	"trafficSplit": [50, 50],
	"duration": 14
}
```

---

## 🌟 Enterprise Features

### Business Intelligence

#### Get Revenue Analytics

```http
GET /api/v1/admin/bi/revenue-analytics?period=30d
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {
		"period": "30d",
		"totalRevenue": 125000,
		"growth": "+15.2%",
		"breakdown": {
			"subscriptions": 85000,
			"oneTime": 25000,
			"premium": 15000
		},
		"topPlans": [
			{
				"name": "Premium",
				"revenue": 45000,
				"users": 450
			}
		]
	}
}
```

#### Get User Lifetime Value

```http
GET /api/v1/admin/bi/user-lifetime-value?segment=premium
```

---

## 👥 User Management

### Basic User Operations

#### Get All Users

```http
GET /api/v1/admin/users?page=1&limit=20&search=john&role=user&isActive=true&sortBy=createdAt&sortOrder=desc
```

#### Get User by ID

```http
GET /api/v1/admin/users/:id
```

#### Update User

```http
PUT /api/v1/admin/users/:id
```

**Request Body:**

```json
{
	"firstName": "John",
	"lastName": "Doe",
	"email": "john.doe@example.com",
	"role": "user"
}
```

#### Delete User

```http
DELETE /api/v1/admin/users/:id
```

### User Status Management

#### Suspend User

```http
PATCH /api/v1/admin/users/:id/suspend
```

**Request Body:**

```json
{
	"reason": "Violation of terms of service"
}
```

#### Activate User

```http
PATCH /api/v1/admin/users/:id/activate
```

#### Verify User Account

```http
PATCH /api/v1/admin/users/:id/verify
```

### Advanced User Operations

#### Search Users

```http
GET /api/v1/admin/users/search?q=john&role=user&isActive=true&page=1&limit=20
```

#### Bulk Export Users

```http
GET /api/v1/admin/users/export?format=csv&role=user&isActive=true&fields=username,email,createdAt
```

#### Bulk Import Users

```http
POST /api/v1/admin/users/import
Content-Type: multipart/form-data

csvFile: [CSV file]
skipDuplicates: true
updateExisting: false
validateOnly: false
```

#### Bulk Actions

```http
POST /api/v1/admin/users/bulk-actions
```

**Request Body:**

```json
{
	"action": "suspend",
	"userIds": ["user1", "user2", "user3"],
	"data": {
		"reason": "Bulk suspension for policy violation"
	},
	"confirmPassword": "admin_password"
}
```

### User Analytics & Monitoring

#### Get User Activity Log

```http
GET /api/v1/admin/users/:id/activity-log?page=1&limit=20&dateFrom=2024-01-01&dateTo=2024-01-31
```

#### Get User Login History

```http
GET /api/v1/admin/users/:id/login-history?page=1&limit=20
```

#### Get User Device Info

```http
GET /api/v1/admin/users/:id/devices
```

#### Get User Security Analysis

```http
GET /api/v1/admin/users/:id/security-analysis?includeDevices=true&includeSessions=true
```

### Communication & Security

#### Send Notification to User

```http
POST /api/v1/admin/users/:id/notify
```

**Request Body:**

```json
{
	"title": "Account Update Required",
	"message": "Please update your profile information.",
	"type": "warning",
	"priority": "high",
	"channels": ["email", "in-app"],
	"trackDelivery": true
}
```

#### Force Password Reset

```http
POST /api/v1/admin/users/:id/force-password-reset
```

**Request Body:**

```json
{
	"reason": "Security concern - suspicious activity detected",
	"notifyUser": true,
	"invalidateAllSessions": true,
	"confirmPassword": "admin_password"
}
```

---

## ❌ Error Codes

### Common Error Responses

#### 400 Bad Request

```json
{
	"statusCode": 400,
	"data": null,
	"message": "Invalid request parameters",
	"success": false
}
```

#### 401 Unauthorized

```json
{
	"statusCode": 401,
	"data": null,
	"message": "Authentication required",
	"success": false
}
```

#### 403 Forbidden

```json
{
	"statusCode": 403,
	"data": null,
	"message": "Access denied. Admin privileges required",
	"success": false
}
```

#### 404 Not Found

```json
{
	"statusCode": 404,
	"data": null,
	"message": "Resource not found",
	"success": false
}
```

#### 429 Too Many Requests

```json
{
	"statusCode": 429,
	"data": null,
	"message": "Rate limit exceeded. Please try again later",
	"success": false
}
```

#### 500 Internal Server Error

```json
{
	"statusCode": 500,
	"data": null,
	"message": "Internal server error",
	"success": false
}
```

---

## 📝 Rate Limiting

All admin endpoints are rate-limited:

- **Standard endpoints**: 1000 requests per hour
- **Bulk operations**: 100 requests per hour
- **Export operations**: 50 requests per hour
- **Critical operations**: 20 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704067200
```

---

## 🔒 Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Admin role verification on all routes
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Prevents abuse and DoS attacks
5. **Audit Logging**: All admin actions are logged
6. **IP Whitelisting**: Optional IP restriction for sensitive operations
7. **MFA Support**: Multi-factor authentication for critical actions

---

## 📊 Performance Optimization

1. **Caching**: Aggressive caching with Redis
2. **Database Optimization**: Indexed queries and aggregation pipelines
3. **Pagination**: All list endpoints support pagination
4. **Bulk Operations**: Batch processing for better performance
5. **Streaming**: Large exports use streaming responses
6. **Connection Pooling**: Optimized database connections

---

## 🚀 Production Deployment

### Environment Variables

```env
# Admin Configuration
ADMIN_RATE_LIMIT_MAX=1000
ADMIN_RATE_LIMIT_WINDOW=3600000
ADMIN_SESSION_TIMEOUT=3600
ADMIN_MFA_REQUIRED=false
ADMIN_IP_WHITELIST_ENABLED=false

# Monitoring
MONITORING_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
PERFORMANCE_TRACKING=true

# Automation
AUTOMATION_ENABLED=true
AUTOMATION_MAX_BATCH_SIZE=1000
```

### Health Check Endpoint

```http
GET /api/v1/admin/monitoring/server-health
```

Use this endpoint for load balancer health checks and monitoring systems.

---

## 📞 Support

For API support and documentation updates:

- **Email**: admin-api-support@yourcompany.com
- **Documentation**: https://docs.yourcompany.com/admin-api
- **Status Page**: https://status.yourcompany.com

---

**Last Updated**: January 2024  
**API Version**: 2.0.0  
**Documentation Version**: 1.0.0
