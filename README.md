# 💬 EndlessChat - API_Social Media Blog Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21+-purple.svg?logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?logo=javascript&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-47A248.svg?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-594639.svg?logo=mongoose&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D.svg?logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-black.svg?logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-0db7ed.svg?logo=docker&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-Process_Manager-2B037A.svg?logo=pm2&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5.svg?logo=cloudinary&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-44A6D8.svg?logo=nodemailer&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325.svg?logo=jest&logoColor=white)
![Winston](https://img.shields.io/badge/Winston-Logging-6B5A8A.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![ESLint](https://img.shields.io/badge/Code%20Style-ESLint-4B32C3.svg?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Formatter-Prettier-F7B93E.svg?logo=prettier&logoColor=black)
![Husky](https://img.shields.io/badge/Husky-Git_Hooks-A60000.svg?logo=husky&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-Validation-000000.svg?logo=joi&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1.svg?logo=zod&logoColor=white)
![Security](https://img.shields.io/badge/Security-Enterprise_Grade-crimson.svg)
![License](https://img.shields.io/badge/License-MIT-gold.svg)

**Enterprise-grade social media blog platform with advanced user management, comprehensive admin controls, and scalable
architecture**

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [📚 API Docs](#-api-documentation) •
[🔧 Development](#-development-setup) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Overview

A **modern, scalable social media blog platform** built with Node.js and Express.js, designed for enterprise-level
applications. Features comprehensive user management, advanced admin controls, real-time notifications, file uploads,
and robust security measures.

### 🌟 Key Highlights

- **🔒 Enterprise Security** - JWT authentication, RBAC, rate limiting, session tracking
- **👑 Advanced Admin System** - Comprehensive dashboard, user moderation, analytics
- **📊 Real-time Analytics** - User engagement, system metrics, business intelligence
- **📁 File Management** - Cloudinary integration, image optimization, secure uploads
- **🔔 Notification System** - Email notifications, templates, bulk messaging
- **⚡ High Performance** - Redis caching, optimized queries, connection pooling
- **🛡️ Security First** - Input validation, XSS protection, CORS, helmet security

---

## ✨ Features

### 🔐 Authentication & Security

- **JWT Authentication** with access and refresh tokens
- **Role-based Access Control** (User, Admin, Super Admin)
- **Session Management** with Redis storage and tracking
- **Password Security** with bcrypt hashing and strength validation
- **Email Verification** and password reset functionality
- **Rate Limiting** and brute force protection
- **Security Headers** with Helmet.js

### 👥 User Management

- **User Registration & Login** with flexible identifier support
- **Profile Management** with avatar and cover image uploads
- **Social Features** - Follow/unfollow, user search, feed generation
- **User Preferences** and privacy settings
- **Activity Tracking** and audit logs
- **Account Verification** and status management

### 📝 Blog & Content Management

- **Blog Post Creation** with rich content support
- **Comment System** with engagement tracking
- **Media Integration** for images and videos
- **Content Analytics** and performance metrics
- **Post Moderation** and visibility controls

### 👑 Advanced Admin System

- **Comprehensive Dashboard** with real-time statistics
- **User Management** - suspend, activate, verify accounts
- **Content Moderation** - post visibility, comment management
- **Security Monitoring** - suspicious accounts, login attempts, IP blocking
- **Analytics & Reporting** - user growth, engagement metrics, demographics
- **System Health** monitoring and database statistics
- **Bulk Operations** - user export, bulk actions, notifications

### 🔔 Notification System

- **In-App Notifications** with real-time delivery
- **Email Notifications** with EJS templates
- **Automated Emails** - Password reset, password reset success
- **Device Tracking** - IP, OS, Platform info in security emails
- **Notification Preferences** - User-configurable settings
- **Notification Stats** - Read/unread tracking
- **Bulk Notifications** - System-wide announcements

### 📁 File & Media Management

- **Cloudinary Integration** for image storage and optimization
- **Secure File Uploads** with validation and size limits
- **Image Processing** with automatic optimization
- **CDN Delivery** for global performance

---

## 🏗️ Architecture

### Modular Structure

```
social-media-blog-app/
├── 📁 src/
│   ├── 📄 app.js                     # Express application setup
│   └── 📄 server.js                  # Server initialization
│   ├── 📁 config/
│   │   ├── 📄 index.js                  # Config aggregator
│   │   ├── 📄 performance.config.js     # Performance settings
│   │   ├── 📁 database/
│   │   │   └── 📄 connection.js         # MongoDB connection
│   │   ├── 📁 queue/
│   │   └── 📁 redis/
│   │       ├── 📄 redis.config.js
│   │       └── 📄 redis.optimized.js
│   ├── 📁 core/
│   ├── 📁 modules/
│   │   ├── 📁 admin/
│   │   │   ├── 📄 index.js
│   │   │   ├── 📁 controllers/
│   │   │   │   ├── 📄 admin.controller.js
│   │   │   │   ├── 📄 advanced.controller.js
│   │   │   │   ├── 📄 analytics.controller.js
│   │   │   │   ├── 📄 dashboard.controller.js
│   │   │   │   ├── 📄 monitoring.controller.js
│   │   │   │   ├── 📄 security.controller.js
│   │   │   │   ├── 📄 session.controller.js
│   │   │   │   └── 📄 super-admin.controller.js
│   │   │   ├── 📁 routes/
│   │   │   │   ├── 📄 admin.routes.js
│   │   │   │   └── 📄 super-admin.routes.js
│   │   │   ├── 📁 services/
│   │   │   │   ├── 📄 analytics.service.js
│   │   │   │   ├── 📄 audit.service.js
│   │   │   │   ├── 📄 automation.service.js
│   │   │   │   ├── 📄 cache.service.js
│   │   │   │   ├── 📄 exportImport.service.js
│   │   │   │   ├── 📄 monitoring.service.js
│   │   │   │   ├── 📄 notification.service.js
│   │   │   │   ├── 📄 queryBuilder.service.js
│   │   │   │   ├── 📄 redis.service.js
│   │   │   │   ├── 📄 security.service.js
│   │   │   │   ├── 📄 super-admin.service.js
│   │   │   │   ├── 📄 system.service.js
│   │   │   │   └── 📄 validation.service.js
│   │   │   └── 📁 validators/
│   │   │       └── 📄 super-admin.validator.js
│   │   ├── 📁 auth/
│   │   │   ├── 📄 index.js
│   │   │   ├── 📁 controllers/
│   │   │   │   ├── 📄 activity.controller.js
│   │   │   │   ├── 📄 auth.controller.js
│   │   │   │   ├── 📄 forgotPassword.controller.js
│   │   │   │   └── 📄 resetPassword.controller.js
│   │   │   ├── 📁 models/
│   │   │   │   └── 📄 userActivity.model.js
│   │   │   ├── 📁 routes/
│   │   │   │   ├── 📄 auth.routes.js
│   │   │   │   ├── 📄 forgotPassword.routes.js
│   │   │   │   ├── 📄 resetPassword.routes.js
│   │   │   │   └── 📄 security.routes.js
│   │   │   └── 📁 services/
│   │   │       ├── 📄 auth.service.js
│   │   │       ├── 📄 location.service.js
│   │   │       └── 📄 security.service.js
│   │   ├── 📁 blogs/
│   │   │   ├── 📄 index.js
│   │   │   ├── 📁 controllers/
│   │   │   │   ├── 📄 analytics.controller.js
│   │   │   │   └── 📁 comment/
│   │   │   ├── 📁 models/
│   │   │   ├── 📁 routes/
│   │   │   └── 📁 services/
│   │   ├── 📁 email/
│   │   │   ├── 📄 index.js
│   │   │   ├── 📁 controllers/
│   │   │   ├── 📁 services/
│   │   │   ├── 📁 templates/
│   │   │   ├── 📁 utils/
│   │   │   ├── 📁 views/
│   │   │   └── 📁 workers/
│   │   ├── 📁 notifications/
│   │   │   ├── 📄 index.js
│   │   │   ├── 📁 controllers/
│   │   │   ├── 📁 models/
│   │   │   ├── 📁 routes/
│   │   │   └── 📁 services/
│   │   ├── 📁 shared/
│   │   │   └── 📁 config/
│   │   └── 📁 users/
│   │       ├── 📄 index.js
│   │       ├── 📁 controllers/
│   │       ├── 📁 middleware/
│   │       ├── 📁 models/
│   │       ├── 📁 routes/
│   │       ├── 📁 services/
│   │       └── 📁 validators/
│   ├── 📁 routes/
│   │   └── 📄 index.js
│   ├── 📁 services/
│   │   ├── 📁 auth/
│   │   ├── 📁 email/
│   │   └── 📁 user/
│   └── 📁 shared/
│       ├── 📄 index.js
│       ├── 📁 config/
│       │   └── 📄 redis.config.js
│       ├── 📁 constants/
│       │   ├── 📄 app.constants.js
│       │   ├── 📄 index.js
│       │   └── 📄 post.constants.js
│       ├── 📁 controllers/
│       │   └── 📄 media.controller.js
│       ├── 📁 middleware/
│       │   ├── 📄 auth.middleware.js
│       │   ├── 📄 cors.middleware.js
│       │   ├── 📄 csrf.middleware.js
│       │   ├── 📄 enterprise.middleware.js
│       │   ├── 📄 isAdmin.middleware.js
│       │   ├── 📄 locationTracker.middleware.js
│       │   ├── 📄 multer.middleware.js
│       │   ├── 📄 optionalAuth.middleware.js
│       │   ├── 📄 performance.middleware.js
│       │   ├── 📄 rateLimit.middleware.js
│       │   ├── 📄 rbac.middleware.js
│       │   ├── 📄 sessionTracker.middleware.js
│       │   ├── 📄 superAdmin.middleware.js
│       │   ├── 📄 upload.middleware.js
│       │   ├── 📄 validate.middleware.js
│       │   └── 📄 validation.middleware.js
│       ├── 📁 routes/
│       │   └── 📄 media.routes.js
│       ├── 📁 services/
│       │   ├── 📄 cache.service.js
│       │   ├── 📄 cloudinary.service.js
│       │   ├── 📄 logger.service.js
│       │   ├── 📄 metrics.service.js
│       │   └── 📄 session.service.js
│       ├── 📁 utils/
│       │   ├── 📄 ApiError.js
│       │   ├── 📄 ApiHealth.js
│       │   ├── 📄 ApiResponse.js
│       │   ├── 📄 AsyncHandler.js
│       │   ├── 📄 Cache.js
│       │   ├── 📄 cookieOptions.js
│       │   ├── 📄 EnterpriseResponse.js
│       │   ├── 📄 ErrorHandler.js
│       │   ├── 📄 Logger.js
│       │   ├── 📄 ResponseFormatter.js
│       │   ├── 📄 SecurityValidator.js
│       │   ├── 📄 sendEmail.js
│       │   ├── 📄 sessionManager.js
│       │   └── 📄 Validator.js
│       └── 📁 validators/
│           ├── 📄 search.validator.js
│           └── 📄 zod.validator.js
└── 📁 uploads/
    ├── 📁 images/
    ├── 📁 temp/
    └── 📁 videos/
```

### Entity-Relationship Diagram

An overview of the database schema and relationships can be found here:

[🔗 View ERD on Eraser.io](https://app.eraser.io/workspace/uefP13tvRBw0rnHOi2vq?origin=)

### Technology Stack

| Layer              | Technologies                   |
| ------------------ | ------------------------------ |
| **Runtime**        | Node.js 20+, ES6 Modules       |
| **Framework**      | Express.js 4.21+               |
| **Database**       | MongoDB 8.0+ with Mongoose ODM |
| **Cache**          | Redis 7.0+ with IORedis        |
| **Authentication** | JWT, bcrypt                    |
| **Validation**     | Joi, Zod, express-validator    |
| **File Storage**   | Cloudinary, Multer             |
| **Email**          | Nodemailer with EJS templates  |
| **Security**       | Helmet, CORS, Rate Limiting    |
| **Logging**        | Winston, Morgan                |
| **Testing**        | Jest, Supertest                |
| **DevOps**         | Docker, PM2                    |
| **Code Quality**   | ESLint, Prettier, Husky        |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Purpose                     |
| ----------- | ------- | --------------------------- |
| **Node.js** | 20+     | Runtime environment         |
| **MongoDB** | 8.0+    | Primary database            |
| **Redis**   | 7.0+    | Caching & sessions          |
| **Docker**  | 20+     | Containerization (optional) |

### Installation

```bash
# 1. Clone repository
git clone https://github.com/mr-deepansh/social-media-blog-app.git
cd social-media-blog-app

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start Redis (using Docker)
docker-compose up -d

# 5. Start the application
npm run dev

# 6. Verify installation
curl http://localhost:5000/health
```

### Environment Configuration

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
API_VERSION=v2
CORS_ORIGIN=*
BODY_LIMIT=16kb
HTTPS_ENABLED=false
CSRF_PROTECTION=true
BASE_URL=http://localhost:5000/api/v2
FRONTEND_URL=http://localhost:8080

# Database
MONGODB_URI=your-mongodb-uri
MONGODB_DB_NAME=endlesschat
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
DB_TIMEOUT=5000
DB_SOCKET_TIMEOUT=45000

# JWT Security
JWT_SECRET=your-jwt-secret-key
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
ACCESS_TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d
JWT_ISSUER=yourcompany
JWT_AUDIENCE=yourapp

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX=yourapp:dev
CACHE_TTL=1800

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Your Company

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=your-folder
CLOUDINARY_FORMAT=auto
CLOUDINARY_QUALITY=auto

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=./logs

# Security
PASSWORD_MIN_LENGTH=8
PASSWORD_RESET_TOKEN_EXPIRY=15
RATE_LIMIT_WINDOW_MS=900000
COOKIE_MAXAGE_DAY=7
COOKIE_MAXAGE_REMEMBER_ME=30
```

---

## 📚 API Documentation

### Server URL

```typescript
const SERVER = "http://localhost:5000/api/v2";
// Production: 'https://your-domain.com/api/v2'
```

### Authentication

```typescript
Headers: {
  'Authorization': 'Bearer {accessToken}',
  'Content-Type': 'application/json'
}
```

### Core Endpoints

#### 🏥 Health & Status

```typescript
// Health Check
GET    ${SERVER}/../../health                # API health check
GET    ${SERVER}                             # API version info
GET    /                                     # Root welcome message
```

#### 🔐 Authentication & Authorization

```typescript
// User Registration & Login
POST   ${SERVER}/users/register              # User registration
POST   ${SERVER}/users/login                 # User login
POST   ${SERVER}/users/logout                # User logout (Protected)
POST   ${SERVER}/users/refresh-token         # Refresh access token

// Email Verification
POST   ${SERVER}/users/verify-email/:token   # Verify email address
POST   ${SERVER}/users/resend-verification   # Resend verification email (Protected)
POST   ${SERVER}/auth/verify-email/:token    # Verify email address (Alternative)
POST   ${SERVER}/auth/resend-verification    # Resend verification email (Protected)

// Password Management
POST   ${SERVER}/users/forgot-password       # Request password reset
POST   ${SERVER}/users/reset-password/:token # Reset password with token
POST   ${SERVER}/auth/forgot-password        # Request password reset (Alternative)
POST   ${SERVER}/auth/reset-password/:token  # Reset password with token (Alternative)
POST   ${SERVER}/users/change-password       # Change password (Protected)

// Activity & Security
GET    ${SERVER}/auth/activity               # Get user activity log (Protected)
GET    ${SERVER}/auth/activity/stats         # Activity statistics (Protected)
GET    ${SERVER}/auth/activity/locations     # Login locations (Protected)
GET    ${SERVER}/auth/activity/location-analytics # Location analytics (Protected)
GET    ${SERVER}/auth/security-overview      # Security overview (Protected)
GET    ${SERVER}/auth/security/dashboard     # Comprehensive security dashboard (Protected)
GET    ${SERVER}/auth/security/threat-assessment # Real-time threat assessment (Protected)
GET    ${SERVER}/auth/security/compliance-report # Compliance report (Protected)
POST   ${SERVER}/auth/security/validate-ip   # Validate IP threat status (Protected)
```

#### 👥 User Management

```typescript
// Current User Profile
GET    ${SERVER}/users/profile               # Get current user profile (Protected)
GET    ${SERVER}/users/profile/me            # Get current user profile (Protected)
PUT    ${SERVER}/users/profile               # Update current user profile (Protected)
PUT    ${SERVER}/users/profile/me            # Update current user profile (Protected)

// Public User Profiles
GET    ${SERVER}/users/profile/:username     # Get user profile by username (Protected)
GET    ${SERVER}/users/profile/:username/posts # Get user posts by username (Protected)

// User Actions
POST   ${SERVER}/users/upload-avatar         # Upload avatar image (Protected)
POST   ${SERVER}/users/upload-cover          # Upload cover image (Protected)

// Social Features - Feed & Search
GET    ${SERVER}/users/feed                  # Get personalized feed (Protected)
GET    ${SERVER}/users/search                # Search users (Protected)

// Social Features - Follow/Unfollow
POST   ${SERVER}/users/follow/:userId        # Follow user (Protected)
POST   ${SERVER}/users/unfollow/:userId      # Unfollow user (Protected)
POST   ${SERVER}/users/:userId/follow        # Follow user - Alternative (Protected)
DELETE ${SERVER}/users/:userId/follow        # Unfollow user - Alternative (Protected)

// Social Features - Followers & Following
GET    ${SERVER}/users/followers/:userId     # Get user followers (Protected)
GET    ${SERVER}/users/following/:userId     # Get user following (Protected)
GET    ${SERVER}/users/:userId/followers     # Get user followers - Alternative (Protected)
GET    ${SERVER}/users/:userId/following     # Get user following - Alternative (Protected)
GET    ${SERVER}/users/:userId/follow-status # Check follow status (Protected)

// User CRUD Operations
GET    ${SERVER}/users                       # Get all users (Protected)
GET    ${SERVER}/users/:id                   # Get user by ID (Protected)
PUT    ${SERVER}/users/:id                   # Update user (Protected)
DELETE ${SERVER}/users/:id                   # Delete user (Protected)
```

#### 📝 Blog Management

```typescript
// Posts - Create & List
POST   ${SERVER}/blogs/posts                 # Create new post (Protected)
GET    ${SERVER}/blogs/posts                 # Get all posts (Public/Optional Auth)
GET    ${SERVER}/blogs/posts/my-posts        # Get current user posts (Protected)
GET    ${SERVER}/blogs/posts/user/:username  # Get posts by username (Public/Optional Auth)

// Posts - Read, Update, Delete
GET    ${SERVER}/blogs/posts/:id             # Get post by ID (Public/Optional Auth)
GET    ${SERVER}/blogs/posts/public/:id      # Get public post by ID (Public)
GET    ${SERVER}/blogs/posts/:username/post/:id # Get post by username and ID (Public/Optional Auth)
PATCH  ${SERVER}/blogs/posts/:id             # Update post (Protected)
DELETE ${SERVER}/blogs/posts/:id             # Delete post (Protected)

// Comments
GET    ${SERVER}/blogs/comments/:postId      # Get post comments (Public/Optional Auth)
POST   ${SERVER}/blogs/comments/:postId      # Add comment (Protected)

// Engagement - Interactions
POST   ${SERVER}/blogs/engagement/:postId/like     # Toggle like (Protected)
POST   ${SERVER}/blogs/engagement/:postId/view     # Track view (Public/Optional Auth)
POST   ${SERVER}/blogs/engagement/:postId/repost   # Repost (Protected)
POST   ${SERVER}/blogs/engagement/:postId/bookmark # Toggle bookmark (Protected)
POST   ${SERVER}/blogs/engagement/:postId/share    # Track share (Protected)

// Bookmarks
GET    ${SERVER}/blogs/bookmarks             # Get bookmarked posts (Protected)

// Media Management
POST   ${SERVER}/blogs/media/upload          # Upload media files (Protected)
GET    ${SERVER}/blogs/media                 # Get media files (Protected)
DELETE ${SERVER}/blogs/media/:mediaId        # Delete media (Protected)

// Analytics - User & Platform
GET    ${SERVER}/blogs/analytics/user        # User analytics (Protected)
GET    ${SERVER}/blogs/analytics/platform    # Platform analytics (Protected)
GET    ${SERVER}/blogs/analytics/post/:id    # Post analytics (Protected)
GET    ${SERVER}/blogs/analytics/post/:id/realtime # Real-time engagement (Protected)

// Analytics - Scheduling
GET    ${SERVER}/blogs/analytics/scheduled   # Get scheduled posts (Protected)
GET    ${SERVER}/blogs/analytics/scheduling  # Get scheduling analytics (Protected)
DELETE ${SERVER}/blogs/analytics/scheduled/:id # Cancel scheduled post (Protected)
PATCH  ${SERVER}/blogs/analytics/scheduled/:id # Reschedule post (Protected)
```

#### 👑 Admin Dashboard

```typescript
// Dashboard & Statistics
GET    ${SERVER}/admin/dashboard             # Admin dashboard (Admin)
GET    ${SERVER}/admin/stats                 # System statistics (Admin)
GET    ${SERVER}/admin/stats/live            # Live statistics (Admin)

// Admin Management
GET    ${SERVER}/admin/admins                # Get all admins (Admin)
GET    ${SERVER}/admin/admins/:adminId       # Get admin by ID (Admin)

// Session Management
GET    ${SERVER}/admin/sessions/analytics    # Admin session analytics (Admin)
GET    ${SERVER}/admin/sessions/:adminId     # Admin session details (Admin)

// User Management - List & Search
GET    ${SERVER}/admin/users                 # Get all users (Admin)
GET    ${SERVER}/admin/users/search          # Search users (Admin)
GET    ${SERVER}/admin/users/export          # Export users in CSV format (Admin)

// User Management - CRUD
GET    ${SERVER}/admin/users/:id             # Get user by ID (Admin)
PUT    ${SERVER}/admin/users/:id             # Update user (Admin)
DELETE ${SERVER}/admin/users/:id             # Delete user (Admin)

// User Management - Status Control
PATCH  ${SERVER}/admin/users/:id/suspend     # Suspend user (Admin)
PATCH  ${SERVER}/admin/users/:id/activate    # Activate user (Admin)
PATCH  ${SERVER}/admin/users/:id/verify      # Verify user account (Admin)

// User Management - Monitoring
GET    ${SERVER}/admin/users/:id/activity-log # User activity log (Admin)
GET    ${SERVER}/admin/users/:id/security-analysis # Security analysis (Admin)

// User Management - Actions
POST   ${SERVER}/admin/users/:id/notify      # Send notification to user (Admin)
POST   ${SERVER}/admin/users/:id/force-password-reset # Force password reset (Admin)
POST   ${SERVER}/admin/users/bulk-actions    # Bulk user actions (Admin)

// Analytics - Overview
GET    ${SERVER}/admin/analytics/overview    # Analytics overview (Admin)
GET    ${SERVER}/admin/analytics/users/growth # User growth analytics (Admin)
GET    ${SERVER}/admin/analytics/users/retention # User retention analytics (Admin)
GET    ${SERVER}/admin/analytics/users/demographics # User demographics (Admin)
GET    ${SERVER}/admin/analytics/engagement/metrics # Engagement metrics (Admin)

// Security - Monitoring
GET    ${SERVER}/admin/security/suspicious-accounts # Suspicious accounts (Admin)
GET    ${SERVER}/admin/security/login-attempts # Login attempts (Admin)
GET    ${SERVER}/admin/security/threat-detection # Threat detection (Admin)

// Security - IP Management
GET    ${SERVER}/admin/security/blocked-ips  # Get blocked IPs (Admin)
POST   ${SERVER}/admin/security/blocked-ips  # Block IP address (Admin)
DELETE ${SERVER}/admin/security/blocked-ips/:ipId # Unblock IP address (Admin)

// Content Moderation
GET    ${SERVER}/admin/content/posts         # Get all posts (Admin)
PATCH  ${SERVER}/admin/content/posts/:postId/toggle-visibility # Toggle post visibility (Admin)

// System Configuration
GET    ${SERVER}/admin/config/app-settings   # Get application settings (Admin)
PUT    ${SERVER}/admin/config/app-settings   # Update application settings (Admin)

// System Monitoring
GET    ${SERVER}/admin/monitoring/server-health # Server health (Admin)
GET    ${SERVER}/admin/monitoring/database-stats # Database statistics (Admin)

// Notifications Management
GET    ${SERVER}/admin/notifications/templates # Get notification templates (Admin)
POST   ${SERVER}/admin/notifications/send-bulk # Send bulk notification (Admin)

// Automation & Workflows
GET    ${SERVER}/admin/automation/rules      # Get automation rules (Admin)
POST   ${SERVER}/admin/automation/rules      # Create automation rule (Admin)

// A/B Testing & Experiments
GET    ${SERVER}/admin/experiments           # Get A/B testing experiments (Admin)
POST   ${SERVER}/admin/experiments           # Create A/B testing experiment (Admin)

// Business Intelligence
GET    ${SERVER}/admin/bi/revenue-analytics  # Get revenue analytics (Admin)
GET    ${SERVER}/admin/bi/user-lifetime-value # Get user lifetime value (Admin)
```

#### 👑 Super Admin

```typescript
// Super Admin Creation
POST   ${SERVER}/admin/create-super-admin    # Create super admin (Public - One-time setup)
POST   ${SERVER}/admin/super-admin/create    # Create super admin (Public - Alternative)

// Admin Management
POST   ${SERVER}/admin/super-admin/create-admin # Create admin user (Super Admin)
GET    ${SERVER}/admin/super-admin/admins    # Get all admins (Super Admin)
PUT    ${SERVER}/admin/super-admin/update-admin/:adminId # Update admin (Super Admin)
DELETE ${SERVER}/admin/super-admin/delete-admin/:adminId # Delete admin (Super Admin)

// Role Management
PUT    ${SERVER}/admin/super-admin/change-role/:userId # Change user role (Super Admin)

// System Configuration
GET    ${SERVER}/admin/super-admin/system-config # Get system configuration (Super Admin)
PUT    ${SERVER}/admin/super-admin/system-config # Update system configuration (Super Admin)

// Audit & Compliance
GET    ${SERVER}/admin/super-admin/audit-logs # Get audit logs (Super Admin)

// System Health
GET    ${SERVER}/admin/super-admin/system-health # Get system health (Super Admin)

// Emergency Operations
POST   ${SERVER}/admin/super-admin/emergency-lockdown # Emergency system lockdown (Super Admin)
```

#### 🔔 Notifications

```typescript
// Notification Management
GET    ${SERVER}/notifications               # Get notifications (Protected)
GET    ${SERVER}/notifications/unread-count  # Get unread count (Protected)
PATCH  ${SERVER}/notifications/:notificationId/read # Mark notification as read (Protected)
PATCH  ${SERVER}/notifications/mark-all-read # Mark all as read (Protected)
DELETE ${SERVER}/notifications/:notificationId # Delete notification (Protected)
DELETE ${SERVER}/notifications/clear-all     # Clear all notifications (Protected)

// Notification Statistics
GET    ${SERVER}/notifications/stats         # Get notification statistics (Protected)

// Notification Preferences
GET    ${SERVER}/notifications/preferences   # Get notification preferences (Protected)
PUT    ${SERVER}/notifications/preferences   # Update notification preferences (Protected)

// System Notifications (Admin)
POST   ${SERVER}/notifications/system        # Create system notification (Protected/Admin)
```

**📖 Complete API Documentation**: [API Reference](docs/COMPLETE_API_ENDPOINTS.md)

---

## 🔧 Development Setup

### Development Scripts

```bash
# Development
npm run dev                  # Start development server
npm run dev:clean            # Clean start (kill port 5000)

# Production
npm start                    # Start production server
npm run start:prod           # Production with logging
npm run start:cluster        # Start production server in cluster mode with PM2
npm run prod:start           # Production startup script
npm run prod:start:force     # Force production start

# Testing
npm test                     # Run all tests
npm run test:unit            # Unit tests
npm run test:integration     # Integration tests
npm run test:e2e             # End-to-end tests
npm run test:coverage        # Coverage report
npm run test:watch           # Watch mode
npm run test:performance     # Performance tests

# Code Quality
npm run lint                 # Lint and fix
npm run lint:check           # Lint check only
npm run format               # Format code
npm run format:check         # Check formatting

# Docker
npm run docker:build         # Build Docker image
npm run docker:up            # Start containers
npm run docker:down          # Stop containers
npm run docker:logs          # View logs
npm run docker:dev           # Development mode
npm run docker:prod          # Production mode

# Kubernetes
npm run k8s:deploy           # Deploy to Kubernetes
npm run k8s:delete           # Delete from Kubernetes
npm run k8s:status           # Get Kubernetes status

# PM2 Process Manager
npm run pm2:start            # Start with PM2
npm run pm2:stop             # Stop PM2
npm run pm2:restart          # Restart PM2
npm run pm2:reload           # Reload PM2
npm run pm2:delete           # Delete PM2
npm run pm2:logs             # View PM2 logs
npm run pm2:monit            # Monitor PM2
npm run pm2:status           # PM2 status

# Security
npm run security:audit       # Security audit
npm run security:scan        # Security scan

# Git Hooks
npm run prepare              # Setup Husky
npm run husky:setup          # Configure Husky
npm run pre-commit           # Pre-commit hook
npm run pre-push             # Pre-push hook

# Utilities
npm run clean                # Clean install
npm run prod:check-port      # Check port 5000
npm run prod:kill-port       # Kill port 5000
```

### Code Quality Tools

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks (v9+ syntax)
- **Lint-staged** for pre-commit checks
- **Commitlint** for conventional commit messages

---

## 🐳 Deployment

### Docker Deployment

```bash
# Start Redis service
docker-compose up -d

# Build and run application
docker build -t social-media-blog .
docker run -p 5000:5000 social-media-blog
```

### PM2 Production Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
npm run pm2:start

# Monitor application
npm run pm2:monit

# View logs
npm run pm2:logs
```

### Environment-Specific Scripts

```bash
# Development
npm run dev

# Production
npm start

# Docker development
npm run docker:dev

# Health check
curl http://localhost:5000/health
```

---

## 🔒 Security Features

### Authentication Security

- **JWT Tokens** with secure secret keys
- **Refresh Token Rotation** for enhanced security
- **Session Tracking** with Redis storage
- **Rate Limiting** to prevent brute force attacks
- **Password Hashing** with bcrypt

### Application Security

- **Input Validation** with Joi and Zod schemas
- **XSS Protection** with sanitization
- **CORS Configuration** for cross-origin requests
- **Security Headers** with Helmet.js
- **File Upload Security** with type and size validation

### Admin Security

- **Role-based Access Control** (RBAC)
- **Admin Session Tracking**
- **IP Blocking** for suspicious activities
- **Audit Logging** for all admin actions
- **Security Monitoring** dashboard

---

## 📊 Monitoring & Analytics

### System Monitoring

- **Health Check Endpoints** for uptime monitoring
- **Performance Metrics** tracking
- **Error Logging** with Winston
- **Database Connection** monitoring
- **Redis Cache** performance tracking

### Business Analytics

- **User Growth** tracking
- **Engagement Metrics** analysis
- **Content Performance** statistics
- **Admin Activity** monitoring
- **System Usage** reports

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Follow** coding standards and write tests
4. **Commit** with conventional commits: `git commit -m 'feat: add amazing feature'`
5. **Push** and create a Pull Request

### Code Standards

- **JavaScript ES6+** with modules
- **ESLint** configuration compliance
- **Comprehensive testing** required
- **Documentation** updates for new features

**📖 Detailed Guide**: [Contributing Guidelines](CONTRIBUTING.md)

---

## 📄 License

**MIT License** - see [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Deepansh Gangwar

---

## 🌟 Support & Community

### 📞 Get Help

- **📧 Email**: [deepanshgangwar7037@outlook.com](mailto:deepanshgangwar7037@outlook.com)
- **💼 LinkedIn**: [Deepansh Gangwar](https://linkedin.com/in/deepansh-gangwar)
- **🐛 Issues**: [GitHub Issues](https://github.com/mr-deepansh/social-media-blog-app/issues)

### 🎯 Roadmap

- [ ] **Real-time Chat** - WebSocket integration for messaging
- [ ] **Mobile API** - Enhanced mobile app support
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Content Recommendation** - AI-powered content suggestions
- [ ] **Multi-language Support** - Internationalization

---

## 📝 Recent Updates (January 2025)

### ✨ Email System Overhaul

- ✅ **Professional EJS Templates** - All emails now use reusable templates
- ✅ **Device Tracking** - IP, OS, Platform info in security emails
- ✅ **Automated Notifications** - Welcome, login, password reset, account status
- ✅ **Clean Architecture** - Separation of concerns with template engine
- ✅ **Performance Optimized** - Non-blocking async email sending

### 🔧 Technical Improvements

- ✅ Modular architecture with feature-based modules
- ✅ EJS email templates with device tracking
- ✅ Redis-based session management and caching
- ✅ Comprehensive middleware (auth, RBAC, rate limiting)
- ✅ Winston logging with module-specific logs
- ✅ Cloudinary integration for media storage
- ✅ PM2 ecosystem for production deployment
- ✅ Docker Compose for Redis containerization

---

<div align="center">

**🚀 Built with ❤️ by [Deepansh Gangwar](https://github.com/mr-deepansh)**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?style=for-the-badge&logo=github)](https://github.com/mr-deepansh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/deepansh-gangwar)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:deepanshgangwar7037@outlook.com)

**⭐ Star this repository if it helped you! ⭐**

_Building the future of social media platforms._

</div>

---

## 📊 Project Statistics

| Metric                | Value   | Status              |
| --------------------- | ------- | ------------------- |
| **Lines of Code**     | 25,000+ | ✅ Substantial      |
| **API Endpoints**     | 150+    | ✅ Comprehensive    |
| **Modules**           | 6 Core  | ✅ Well Organized   |
| **Middleware**        | 17+     | ✅ Robust           |
| **Database Models**   | 10+     | ✅ Complete         |
| **Email Templates**   | 2+      | ✅ Production Ready |
| **Admin Features**    | 60+     | ✅ Enterprise Grade |
| **Security Features** | 25+     | ✅ Production Ready |
| **Documentation**     | 95%+    | ✅ Well Documented  |
