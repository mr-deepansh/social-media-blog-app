# 💬 Social Media Blog Platform

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
![ESLint](https://img.shields.io/badge/Code%20Style-ESLint-4B32C3.svg?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Formatter-Prettier-F7B93E.svg?logo=prettier&logoColor=black)
![Husky](https://img.shields.io/badge/Husky-Git_Hooks-A60000.svg?logo=husky&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-Validation-000000.svg?logo=joi&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1.svg?logo=zod&logoColor=white)
![Security](https://img.shields.io/badge/Security-Enterprise_Grade-crimson.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)
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
│   ├── 📁 modules/                    # Feature modules
│   │   ├── 🔐 auth/                  # Authentication & verification
│   │   │   ├── controllers/          # Auth controllers
│   │   │   ├── models/               # Auth models
│   │   │   ├── routes/               # Auth routes
│   │   │   └── services/             # Auth business logic
│   │   ├── 👤 users/                 # User management
│   │   │   ├── controllers/          # User controllers
│   │   │   ├── middleware/           # User-specific middleware
│   │   │   ├── models/               # User models
│   │   │   ├── routes/               # User routes
│   │   │   ├── services/             # User business logic
│   │   │   └── validators/           # User validation schemas
│   │   ├── 📝 blogs/                 # Blog & content system
│   │   │   ├── controllers/          # Blog controllers
│   │   │   ├── models/               # Blog models
│   │   │   ├── routes/               # Blog routes
│   │   │   └── services/             # Blog business logic
│   │   ├── 👑 admin/                 # Admin dashboard & controls
│   │   │   ├── controllers/          # Admin controllers
│   │   │   ├── routes/               # Admin routes
│   │   │   ├── services/             # Admin business logic
│   │   │   └── validators/           # Admin validation schemas
│   │   ├── 🔔 notifications/         # Notification system
│   │   │   ├── controllers/          # Notification controllers
│   │   │   ├── models/               # Notification models
│   │   │   ├── routes/               # Notification routes
│   │   │   └── services/             # Notification business logic
│   │   └── 📧 email/                 # Email services
│   │       ├── controllers/          # Email controllers
│   │       ├── services/             # Email sending logic
│   │       ├── templates/            # Email template configs
│   │       ├── views/emails/         # EJS email templates
│   │       ├── utils/                # Email utilities
│   │       └── workers/              # Background email workers
│   ├── 📁 shared/                    # Shared utilities
│   │   ├── middleware/               # Auth, RBAC, rate limiting, CORS
│   │   ├── utils/                    # ApiError, ApiResponse, Logger
│   │   ├── validators/               # Shared validation schemas
│   │   ├── services/                 # Cache, Cloudinary, Session
│   │   ├── controllers/              # Media controller
│   │   ├── routes/                   # Shared routes
│   │   └── constants/                # App constants
│   ├── 📁 config/                    # Configuration
│   │   ├── database/                 # MongoDB connection
│   │   ├── redis/                    # Redis configuration
│   │   ├── queue/                    # Queue configuration
│   │   ├── index.js                  # Config aggregator
│   │   └── performance.config.js     # Performance settings
│   ├── 📁 core/                      # Core utilities
│   ├── 📁 services/                  # Business services
│   │   ├── auth/                     # Auth services
│   │   ├── email/                    # Email services
│   │   └── user/                     # User services
│   ├── 📁 routes/                    # Route aggregator
│   │   └── index.js                  # Health check routes
│   ├── 📄 app.js                     # Express application setup
│   └── 📄 server.js                  # Server initialization
├── 📁 docs/                          # Documentation
│   ├── postman/                      # Postman collections
│   ├── ADMIN_SYSTEM.md               # Admin documentation
│   ├── COMPLETE_API_ENDPOINTS.md     # API reference
│   ├── DATABASE_SCHEMA.md            # Database schema
│   └── HUSKY_SETUP.md                # Git hooks setup
├── 📁 logs/                          # Application logs
├── 📁 Public/Temp/                   # Temporary files
├── 📁 redis-data/                    # Redis persistence
├── 📁 scripts/                       # Utility scripts
│   ├── production-start.js           # Production startup
│   └── setup-husky.js                # Husky configuration
├── 📁 uploads/                       # File uploads
│   ├── images/                       # Image uploads
│   ├── temp/                         # Temporary files
│   └── videos/                       # Video uploads
├── 📦 package.json                   # Dependencies
├── 🐳 docker-compose.yml             # Docker configuration
├── 🐳 Dockerfile                     # Docker image
├── ⚙️ ecosystem.config.cjs           # PM2 configuration
├── 🔧 .env.example                   # Environment template
└── 📝 README.md                      # This file
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

#### Authentication & Authorization

```typescript
// User Authentication
POST   ${SERVER}/users/register              # User registration
POST   ${SERVER}/users/login                 # User login
POST   ${SERVER}/users/logout                # User logout
POST   ${SERVER}/users/refresh-token         # Refresh access token

// Email Verification
POST   ${SERVER}/auth/verify-email/:token    # Verify email address
POST   ${SERVER}/auth/resend-verification    # Resend verification email

// Password Management
POST   ${SERVER}/auth/forgot-password        # Request password reset
POST   ${SERVER}/auth/reset-password/:token  # Reset password with token

// Activity & Security
GET    ${SERVER}/auth/activity               # Get user activity log
GET    ${SERVER}/auth/activity/stats         # Activity statistics
GET    ${SERVER}/auth/activity/locations     # Login locations
GET    ${SERVER}/auth/security-overview      # Security overview
```

#### User Management

```typescript
// Profile Management
GET    ${SERVER}/users/profile                # Get current user profile
PUT    ${SERVER}/users/profile                # Update current user profile
GET    ${SERVER}/users/profile/:username      # Get user by username
GET    ${SERVER}/users/profile/:username/posts # Get users posts

// User Actions
POST   ${SERVER}/users/change-password       # Change password
POST   ${SERVER}/users/upload-avatar         # Upload avatar image
POST   ${SERVER}/users/upload-cover          # Upload cover image

// Social Features
GET    ${SERVER}/users/feed                  # Get personalized feed
GET    ${SERVER}/users/search                # Search users
POST   ${SERVER}/users/follow/:userId        # Follow user
POST   ${SERVER}/users/unfollow/:userId      # Unfollow user
GET    ${SERVER}/users/followers/:userId     # Get user followers
GET    ${SERVER}/users/following/:userId     # Get user following
GET    ${SERVER}/users/:userId/follow-status # Check follow status

// User CRUD (Admin)
GET    ${SERVER}/users                       # Get all users
GET    ${SERVER}/users/:id                   # Get user by ID
PUT    ${SERVER}/users/:id                   # Update user
DELETE ${SERVER}/users/:id                   # Delete user
```

#### Blog Management

```typescript
// Posts
POST   ${SERVER}/blogs/posts                 # Create new post
GET    ${SERVER}/blogs/posts                 # Get all posts
GET    ${SERVER}/blogs/posts/my-posts        # Get current user posts
GET    ${SERVER}/blogs/posts/user/:username  # Get posts by username
GET    ${SERVER}/blogs/posts/:id             # Get post by ID
PATCH  ${SERVER}/blogs/posts/:id             # Update post
DELETE ${SERVER}/blogs/posts/:id             # Delete post

// Comments
GET    ${SERVER}/blogs/comments/:postId      # Get post comments
POST   ${SERVER}/blogs/comments/:postId      # Add comment

// Engagement
POST   ${SERVER}/blogs/engagement/:postId/like     # Toggle like
POST   ${SERVER}/blogs/engagement/:postId/view     # Track view
POST   ${SERVER}/blogs/engagement/:postId/repost   # Repost
POST   ${SERVER}/blogs/engagement/:postId/bookmark # Toggle bookmark

// Media
POST   ${SERVER}/blogs/media/upload          # Upload media files
GET    ${SERVER}/blogs/media                 # Get media files
DELETE ${SERVER}/blogs/media/:mediaId        # Delete media

// Analytics
GET    ${SERVER}/blogs/analytics/user        # User analytics
GET    ${SERVER}/blogs/analytics/platform    # Platform analytics
GET    ${SERVER}/blogs/analytics/post/:id    # Post analytics
GET    ${SERVER}/blogs/analytics/post/:id/realtime # Real-time engagement
```

#### Admin Dashboard

```typescript
// Dashboard & Stats
GET    ${SERVER}/admin/dashboard             # Admin dashboard
GET    ${SERVER}/admin/stats                 # System statistics
GET    ${SERVER}/admin/stats/live            # Live statistics

// User Management
GET    ${SERVER}/admin/users                 # Get all users
GET    ${SERVER}/admin/users/:id             # Get user by ID
PUT    ${SERVER}/admin/users/:id             # Update user
DELETE ${SERVER}/admin/users/:id             # Delete user
PATCH  ${SERVER}/admin/users/:id/suspend     # Suspend user
PATCH  ${SERVER}/admin/users/:id/activate    # Activate user
PATCH  ${SERVER}/admin/users/:id/verify      # Verify user account
GET    ${SERVER}/admin/users/:id/activity-log # User activity log
GET    ${SERVER}/admin/users/:id/security-analysis # Security analysis
POST   ${SERVER}/admin/users/:id/notify      # Send notification
POST   ${SERVER}/admin/users/:id/force-password-reset # Force password reset

// Analytics
GET    ${SERVER}/admin/analytics/overview    # Analytics overview
GET    ${SERVER}/admin/analytics/users/growth # User growth
GET    ${SERVER}/admin/analytics/users/retention # User retention
GET    ${SERVER}/admin/analytics/users/demographics # Demographics
GET    ${SERVER}/admin/analytics/engagement/metrics # Engagement metrics

// Security
GET    ${SERVER}/admin/security/suspicious-accounts # Suspicious accounts
GET    ${SERVER}/admin/security/login-attempts # Login attempts
GET    ${SERVER}/admin/security/blocked-ips  # Blocked IPs
POST   ${SERVER}/admin/security/blocked-ips  # Block IP
DELETE ${SERVER}/admin/security/blocked-ips/:ipId # Unblock IP

// Content Moderation
GET    ${SERVER}/admin/content/posts         # Get all posts
PATCH  ${SERVER}/admin/content/posts/:postId/toggle-visibility # Toggle visibility

// System Monitoring
GET    ${SERVER}/admin/monitoring/server-health # Server health
GET    ${SERVER}/admin/monitoring/database-stats # Database stats
```

#### Super Admin

```typescript
POST   ${SERVER}/admin/super-admin/create    # Create super admin
POST   ${SERVER}/admin/super-admin/create-admin # Create admin
GET    ${SERVER}/admin/super-admin/admins    # Get all admins
PUT    ${SERVER}/admin/super-admin/update-admin/:adminId # Update admin
DELETE ${SERVER}/admin/super-admin/delete-admin/:adminId # Delete admin
PUT    ${SERVER}/admin/super-admin/change-role/:userId # Change user role
GET    ${SERVER}/admin/super-admin/system-config # Get system config
PUT    ${SERVER}/admin/super-admin/system-config # Update system config
GET    ${SERVER}/admin/super-admin/audit-logs # Get audit logs
GET    ${SERVER}/admin/super-admin/system-health # System health
POST   ${SERVER}/admin/super-admin/emergency-lockdown # Emergency lockdown
```

#### Notifications

```typescript
GET    ${SERVER}/notifications                # Get notifications
GET    ${SERVER}/notifications/unread-count   # Get unread count
PATCH  ${SERVER}/notifications/:id/read       # Mark as read
PATCH  ${SERVER}/notifications/mark-all-read  # Mark all as read
DELETE ${SERVER}/notifications/:id            # Delete notification
DELETE ${SERVER}/notifications/clear-all      # Clear all notifications
GET    ${SERVER}/notifications/stats          # Notification stats
GET    ${SERVER}/notifications/preferences    # Get preferences
PUT    ${SERVER}/notifications/preferences    # Update preferences
POST   ${SERVER}/notifications/system         # Create system notification
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
npm run prod:start           # Production startup script
npm run prod:start:force     # Force production start

# Testing
npm test                     # Run all tests
npm run test:unit            # Unit tests
npm run test:integration     # Integration tests
npm run test:e2e             # End-to-end tests
npm run test:coverage        # Coverage report
npm run test:watch           # Watch mode

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
