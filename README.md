# 💬 Social Media Blog Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21+-purple.svg?logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?logo=javascript&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-47A248.svg?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D.svg?logo=redis&logoColor=white)
![Scalability](https://img.shields.io/badge/Scalable-High-darkorange.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-0db7ed.svg?logo=docker&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-API_Testing-FF6C37.svg?logo=postman&logoColor=white)
![Security](https://img.shields.io/badge/Security-Enterprise_Grade-crimson.svg)
![Tests](https://img.shields.io/badge/Tests-Jest-limegreen.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-gold.svg)
![ESLint](https://img.shields.io/badge/Code%20Style-ESLint-4B32C3.svg?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Formatter-Prettier-F7B93E.svg?logo=prettier&logoColor=black)

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

- **Email Notifications** with EJS templates
- **Notification Templates** management
- **Bulk Messaging** capabilities
- **User Notification Preferences**
- **Real-time Alerts** for admin actions

### 📁 File & Media Management

- **Cloudinary Integration** for image storage and optimization
- **Secure File Uploads** with validation and size limits
- **Image Processing** with automatic optimization
- **CDN Delivery** for global performance

---

## 🏗️ Architecture

### Modular Structure

```
src/
├── 📁 modules/                    # Feature modules
│   ├── 🔐 auth/                  # Authentication system
│   ├── 👤 users/                 # User management
│   ├── 📝 blogs/                 # Blog & content system
│   ├── 👑 admin/                 # Admin dashboard & controls
│   ├── 🔔 notifications/         # Notification system
│   └── 📧 email/                 # Email services
├── 📁 shared/                    # Shared utilities
│   ├── middleware/               # Custom middleware
│   ├── utils/                    # Utility functions
│   ├── validators/               # Input validation
│   └── services/                 # Shared services
├── 📁 config/                    # Configuration
│   ├── database/                 # MongoDB connection
│   └── redis/                    # Redis configuration
├── 📄 app.js                     # Express application
└── 📄 server.js                  # Server initialization
```

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

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v2
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/social-media-blog
MONGODB_DB_NAME=social-media-blog

# JWT Security
JWT_SECRET=your-super-secret-jwt-key
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
ACCESS_TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=administer

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000/api/v2
Production: https://your-domain.com/api/v2
```

### Authentication

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Core Endpoints

#### Authentication

```http
POST /api/v2/users/register        # User registration
POST /api/v2/users/login           # User login
POST /api/v2/users/logout          # User logout
POST /api/v2/users/refresh-token   # Refresh access token
POST /api/v2/users/forgot-password # Password reset request
POST /api/v2/users/reset-password/{token} # Reset password
```

#### User Management

```http
GET  /api/v2/users/profile         # Get current user profile
PUT  /api/v2/users/profile         # Update profile
POST /api/v2/users/change-password # Change password
POST /api/v2/users/upload-avatar   # Upload avatar
GET  /api/v2/users/search          # Search users
POST /api/v2/users/follow/{userId} # Follow user
POST /api/v2/users/unfollow/{userId} # Unfollow user
```

#### Blog Management

```http
GET  /api/v2/blogs/posts           # Get all posts
POST /api/v2/blogs/posts           # Create new post
GET  /api/v2/blogs/posts/{id}      # Get specific post
PUT  /api/v2/blogs/posts/{id}      # Update post
DELETE /api/v2/blogs/posts/{id}    # Delete post
```

#### Admin Dashboard

```http
GET  /api/v2/admin/dashboard       # Admin dashboard
GET  /api/v2/admin/stats           # System statistics
GET  /api/v2/admin/users           # Manage users
POST /api/v2/admin/users/{id}/suspend # Suspend user
GET  /api/v2/admin/analytics/overview # Analytics overview
```

**📖 Complete API Documentation**: [API Reference](docs/COMPLETE_API_ENDPOINTS.md)

---

## 🧪 Testing

### Test Structure

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys

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
npm run health:check
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

## 🔧 Development Setup

### Development Scripts

```bash
# Start development server
npm run dev

# Code formatting
npm run format
npm run format:check

# Linting
npm run lint
npm run lint:check

# Database operations
npm run db:seed
npm run db:migrate
npm run db:reset

# Security audit
npm run security:audit
```

### Code Quality Tools

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks (latest v9+ syntax)
- **Lint-staged** for pre-commit checks
- **Commitlint** for conventional commit messages

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

| Metric                   | Value   |
| ------------------------ | ------- |
| **Lines of Code**        | 25,000+ |
| **API Endpoints**        | 50+     |
| **Modules**              | 6       |
| **Middleware**           | 15+     |
| **Database Models**      | 10+     |
| **Admin Features**       | 30+     |
| **Security Features**    | 20+     |
| **File Types Supported** | 5+      |
