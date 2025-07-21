# 🚀 Social Media Blog App - Complete Documentation

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

**A professional-grade social media blog application built with Node.js, Express, and MongoDB**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Features](#-features)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Database & Email Setup](#-database--email-setup)
- [API Documentation](#-api-documentation)
- [Password Reset System](#-password-reset-system)
- [Testing Guide](#-testing-guide)
- [Docker & Deployment](#-docker--deployment)
- [Security Best Practices](#-security-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Development Guidelines](#-development-guidelines)
- [Contributing](#-contributing)
- [License](#-license)

---

## Project Overview

A professional-grade social media blog application built with Node.js, Express, and MongoDB. Features user authentication, secure password reset, blog management, and professional email notifications with EJS templates.

### 🎯 Key Highlights

- **Production-Ready**: Secure, scalable, and well-documented
- **Modern Architecture**: Clean micro-architecture with modular design
- **Professional Email System**: Beautiful HTML emails with EJS templates
- **Comprehensive Testing**: Automated and manual testing suites
- **Docker Support**: Multi-stage builds and Docker Compose
- **Open Source**: MIT licensed with contribution guidelines

---

## ✨ Features

### 🔐 Authentication & Security

- **JWT-based authentication** with refresh tokens
- **Secure password reset** with expiring tokens (SHA-256, 10-15 min expiry)
- **Password hashing** with bcrypt and salt rounds
- **Session invalidation** after password reset
- **No user enumeration** in API responses

### 📧 Email System

- **Professional EJS email templates** (HTML + plain text fallbacks)
- **Beautiful responsive design** with gradients and modern styling
- **Success/failure notifications** for all operations
- **Multiple email service support** (Gmail, SendGrid, etc.)

### 📝 Blog Management

- **Full CRUD operations** for blog posts
- **User association** and permissions
- **Rich text support** and media handling
- **Search and filtering** capabilities

### 🛡️ Security & Performance

- **Helmet** security headers
- **CORS** protection with configurable origins
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **Health checks** and monitoring
- **Request logging** with Morgan

### 🐳 DevOps & Deployment

- **Docker** multi-stage builds
- **Docker Compose** for local development
- **Environment-based configuration**
- **Production deployment guides**
- **Monitoring and logging**

### 🧪 Testing & Quality

- **Automated API testing** suite
- **Manual testing guides** with cURL examples
- **Postman collections** for API testing
- **Code linting** with ESLint
- **Code formatting** with Prettier

---

## 🏗️ Architecture & Folder Structure

### Clean Micro-Architecture Overview

This project follows a **clean micro-architecture** pattern with modular organization, separation of concerns, and scalable structure.

```
social-media-blog-app/
├── 📁 src/                          # Source code
│   ├── 📄 app.js                    # Main Express application
│   ├── 📄 server.js                 # Server entry point
│   ├── 📁 config/                   # Configuration management
│   │   ├── 📄 index.js              # Main configuration exports
│   │   ├── 📁 database/
│   │   │   └── 📄 connection.js     # Database connection
│   │   ├── 📁 email/
│   │   │   └── 📄 email.config.js   # Email configuration
│   │   └── 📁 security/
│   │       └── 📄 security.config.js # Security settings
│   ├── 📁 modules/                  # Feature modules
│   │   ├── 📁 auth/                 # Authentication module
│   │   ├── 📁 users/                # Users module
│   │   ├── 📁 blogs/                # Blogs module
│   │   └── 📁 email/                # Email module
│   └── 📁 shared/                   # Shared utilities
│       ├── 📁 utils/                # Helper functions
│       ├── 📁 middleware/           # Common middleware
│       ├── 📁 constants/            # Application constants
│       └── 📁 validators/           # Validation schemas
├── 📁 Public/                       # Static assets
├── 📁 tests/                        # Test files
├── 📁 docs/                         # Documentation
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git exclusions
├── 📄 package.json                  # Project configuration
├── 📄 Dockerfile                    # Docker configuration
├── 📄 docker-compose.yml           # Docker services
└── 📄 README.md                     # This documentation
```

### Module Structure

Each module follows a consistent MVC pattern:

```
src/modules/[module-name]/
├── 📄 index.js                      # Module exports
├── 📁 controllers/                  # HTTP request handlers
├── 📁 routes/                       # API endpoint definitions
├── 📁 services/                     # Business logic layer
├── 📁 middleware/                   # Module-specific middleware
├── 📁 models/                       # Data models (if applicable)
└── 📁 views/                        # Templates (email module only)
```

### Architecture Principles

1. **Modular Design**: Each feature is self-contained
2. **Separation of Concerns**: Clear boundaries between layers
3. **Dependency Management**: Shared utilities in `src/shared/`
4. **Scalability**: Easy to add new modules and features
5. **Testability**: Isolated components for easy testing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git**

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/mr-deepansh/social-media-blog-app.git
   cd social-media-blog-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Test the API**
   ```bash
   npm test
   ```

### Available Scripts

```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run test             # Run all tests
npm run test:api         # Run API tests
npm run test:endpoints   # Run endpoint tests
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run docker:compose   # Start with Docker Compose
```

---

## ⚙️ Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRY=15

# Email Configuration (Gmail Example)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Social Media Blog App

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## 🗄️ Database & Email Setup

### MongoDB Setup

#### MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier M0)
3. Configure database access (create user with read/write permissions)
4. Configure network access (add your IP or `0.0.0.0/0` for development)
5. Get your connection string and replace placeholders

#### Local MongoDB (Alternative)

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongod

# Connection string for local MongoDB
MONGODB_URI=mongodb://localhost:27017/social_media_blog
```

### Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Security settings
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in your `.env` file

3. **Test Email Configuration**
   ```bash
   npm run test:email
   ```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000
```

### Authentication Endpoints

#### 1. Forgot Password

```http
POST /api/v1/auth/forgot-password
```

**Description:** Send password reset email to user

**Request Body:**

```json
{
	"email": "user@example.com"
}
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {},
	"message": "Password reset link sent to your email",
	"success": true
}
```

#### 2. Reset Password

```http
POST /api/v1/auth/reset-password/:token
```

**Description:** Reset password using token from email

**URL Parameters:**

- `token` - Reset token from email link

**Request Body:**

```json
{
	"newPassword": "newSecurePassword123",
	"confirmPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
	"statusCode": 200,
	"data": {},
	"message": "Password reset successful. Please check your email for confirmation.",
	"success": true
}
```

### User Endpoints

```http
GET    /api/v1/users          # Get all users
POST   /api/v1/users          # Create user
GET    /api/v1/users/:id      # Get user by ID
PUT    /api/v1/users/:id      # Update user
DELETE /api/v1/users/:id      # Delete user
```

### Blog Endpoints

```http
GET    /api/v1/blogs          # Get all blogs
POST   /api/v1/blogs          # Create blog
GET    /api/v1/blogs/:id      # Get blog by ID
PUT    /api/v1/blogs/:id      # Update blog
DELETE /api/v1/blogs/:id      # Delete blog
```

### Health Check

```http
GET /api/v1
```

**Response:**

```json
{
	"success": true,
	"message": "API is Running Successfully",
	"timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Complete API Reference Table

| Method | Route                                | Description       | Access  | Auth Required |
| ------ | ------------------------------------ | ----------------- | ------- | ------------- |
| GET    | `/`                                  | Health check      | Public  | No            |
| GET    | `/api/v1`                            | API version check | Public  | No            |
| POST   | `/api/v1/auth/forgot-password`       | Send reset email  | Public  | No            |
| POST   | `/api/v1/auth/reset-password/:token` | Reset password    | Public  | No            |
| GET    | `/api/v1/users`                      | Get all users     | Private | Yes           |
| POST   | `/api/v1/users`                      | Create user       | Public  | No            |
| GET    | `/api/v1/users/:id`                  | Get user by ID    | Private | Yes           |
| PUT    | `/api/v1/users/:id`                  | Update user       | Private | Yes           |
| DELETE | `/api/v1/users/:id`                  | Delete user       | Private | Yes           |
| GET    | `/api/v1/blogs`                      | Get all blogs     | Public  | No            |
| POST   | `/api/v1/blogs`                      | Create blog       | Private | Yes           |
| GET    | `/api/v1/blogs/:id`                  | Get blog by ID    | Public  | No            |
| PUT    | `/api/v1/blogs/:id`                  | Update blog       | Private | Yes           |
| DELETE | `/api/v1/blogs/:id`                  | Delete blog       | Private | Yes           |

---

## 🔑 Password Reset System

### Features

- **Professional EJS email templates** with HTML and plain text fallbacks
- **Secure token generation** using SHA-256 hashing
- **Token expiration** (10-15 minutes)
- **No user enumeration** - same response for existing/non-existing emails
- **Password validation** and secure hashing
- **Session invalidation** after successful reset
- **Success/failure notifications** via email

### Email Templates

- **Forgot Password**: `src/modules/email/views/emails/forgot-password.ejs`
- **Success Notification**: `src/modules/email/views/emails/password-reset-success.ejs`

### Security Features

- **Token Security**: 32-byte random hex tokens, SHA-256 hashed in database
- **Expiration**: 10-15 minute expiry with automatic cleanup
- **One-time Use**: Tokens are cleared after successful reset
- **Input Validation**: Email format validation and sanitization
- **Rate Limiting**: Prevents abuse (implemented in middleware)

### Frontend Integration Example

#### Forgot Password Form

```javascript
const handleForgotPassword = async (email) => {
	try {
		const response = await fetch("/api/v1/auth/forgot-password", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		});

		const data = await response.json();

		if (data.success) {
			alert("Password reset link sent to your email!");
		} else {
			alert(data.message);
		}
	} catch (error) {
		console.error("Error:", error);
	}
};
```

#### Reset Password Form

```javascript
const handleResetPassword = async (token, newPassword, confirmPassword) => {
	try {
		const response = await fetch(`/api/v1/auth/reset-password/${token}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ newPassword, confirmPassword }),
		});

		const data = await response.json();

		if (data.success) {
			alert("Password reset successful!");
			// Redirect to login page
		} else {
			alert(data.message);
		}
	} catch (error) {
		console.error("Error:", error);
	}
};
```

---

## 🧪 Testing Guide

### Automated Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:api          # API tests
npm run test:endpoints    # Endpoint tests
npm run test:password-reset # Password reset tests
```

### Manual Testing with cURL

#### Health Check

```bash
curl http://localhost:5000/api/v1
```

#### Forgot Password

```bash
# Valid email
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Invalid email format
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'

# Empty email
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": ""}'
```

#### Reset Password

```bash
# Valid token and passwords
curl -X POST http://localhost:5000/api/v1/auth/reset-password/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newSecurePassword123",
    "confirmPassword": "newSecurePassword123"
  }'

# Mismatched passwords
curl -X POST http://localhost:5000/api/v1/auth/reset-password/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newPassword123",
    "confirmPassword": "differentPassword123"
  }'

# Short password
curl -X POST http://localhost:5000/api/v1/auth/reset-password/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "short",
    "confirmPassword": "short"
  }'

# Invalid/expired token
curl -X POST http://localhost:5000/api/v1/auth/reset-password/invalid-token \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newSecurePassword123",
    "confirmPassword": "newSecurePassword123"
  }'
```

### Testing with Postman/Insomnia

1. Import the provided Postman collection
2. Set the base URL to `http://localhost:5000`
3. Use the endpoints listed in the API documentation
4. Test various scenarios (valid/invalid inputs, error cases)

### Expected Test Results

#### Success Responses

```json
{
	"statusCode": 200,
	"data": {},
	"message": "Operation successful",
	"success": true
}
```

#### Error Responses

```json
{
	"statusCode": 400,
	"data": null,
	"message": "Error description",
	"success": false
}
```

---

## 🐳 Docker & Deployment

### Docker Compose (Recommended)

```bash
# Start all services
npm run docker:compose

# Start with monitoring
npm run docker:compose:monitoring

# View logs
npm run docker:logs

# Stop services
npm run docker:stop
```

### Manual Docker

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Run with custom environment
docker run -p 5000:5000 --env-file .env social-media-blog
```

### Production Deployment

#### Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### Docker Production

```bash
# Build production image
docker build -t social-media-blog:prod .

# Run with production environment
docker run -d \
  -p 5000:5000 \
  --env-file .env.production \
  --name social-media-blog \
  social-media-blog:prod
```

### Production Best Practices

1. **Environment Variables**: Use strong secrets in production
2. **HTTPS**: Always use HTTPS in production
3. **Monitoring**: Set up logging and monitoring
4. **Backup**: Regular database backups
5. **Updates**: Keep dependencies updated
6. **Security**: Regular security audits

---

## 🔒 Security Best Practices

### Authentication & Authorization

- Use strong JWT secrets (32+ characters)
- Implement token refresh mechanism
- Set appropriate token expiration times
- Validate user permissions for protected routes

### Password Security

- Use bcrypt with salt rounds (12+)
- Enforce strong password policies
- Implement account lockout after failed attempts
- Use secure password reset tokens

### API Security

- Enable CORS with specific origins
- Implement rate limiting
- Use Helmet for security headers
- Validate and sanitize all inputs
- Use HTTPS in production

### Data Protection

- Never log sensitive data
- Use environment variables for secrets
- Implement proper error handling
- Regular security audits

### Email Security

- Use secure SMTP connections
- Validate email addresses
- Implement email rate limiting
- Use app passwords for Gmail

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check MongoDB connection
npm run test:db

# Verify connection string
echo $MONGODB_URI

# Test with MongoDB Compass
```

#### Email Configuration Issues

```bash
# Test email configuration
npm run test:email

# Check Gmail app password
# Verify 2FA is enabled
# Check firewall/network settings
```

#### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

#### Environment Variables

```bash
# Check if .env file exists
ls -la .env

# Verify environment variables
node -e "console.log(process.env.NODE_ENV)"
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check application logs
npm run logs

# Monitor file changes
npm run dev:watch
```

### Performance Issues

1. **Database**: Check MongoDB performance and indexes
2. **Memory**: Monitor Node.js memory usage
3. **CPU**: Check for CPU-intensive operations
4. **Network**: Verify network connectivity

---

## 👨‍💻 Development Guidelines

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

### File Naming Conventions

- **Controllers**: `*.controller.js`
- **Routes**: `*.routes.js`
- **Services**: `*.service.js`
- **Models**: `*.model.js`
- **Middleware**: `*.middleware.js`
- **Utilities**: `*.util.js` or `*.js`

### Adding New Features

1. Create module directory in `src/modules/`
2. Add standard subdirectories (controllers, routes, services, etc.)
3. Create module index file
4. Add routes to main `app.js`
5. Write tests for new functionality
6. Update documentation

### Testing Guidelines

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 🤝 Contributing

We welcome contributions from the community! Please read these guidelines before contributing.

### How to Contribute

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-username/social-media-blog-app.git
   cd social-media-blog-app
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the coding standards
   - Write tests for new features
   - Update documentation

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Include any relevant issue numbers
   - Ensure all tests pass

### Contribution Guidelines

#### Code Quality

- Follow existing code style and patterns
- Write clean, readable, and maintainable code
- Add appropriate comments and documentation
- Ensure all tests pass

#### Testing

- Write tests for new features
- Update existing tests if needed
- Maintain good test coverage
- Test both success and error scenarios

#### Documentation

- Update README.md if needed
- Add JSDoc comments for new functions
- Update API documentation
- Include examples for new features

#### Pull Request Process

1. Ensure your code follows the project standards
2. Run all tests and ensure they pass
3. Update documentation as needed
4. Provide a clear description of changes
5. Reference any related issues

### Code of Conduct

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and open to feedback
- Focus on what is best for the community
- Show empathy towards other community members

### Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (OS, Node.js version, etc.)
- Any relevant error messages or logs

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

**Permissions:**

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

**Limitations:**

- ❌ Liability
- ❌ Warranty

**Conditions:**

- 📝 License and copyright notice must be included

### Copyright

Copyright (c) 2024 Deepansh Gangwar

---

## 🙏 Acknowledgments

### Open Source Libraries

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Nodemailer](https://nodemailer.com/) - Email sending
- [JWT](https://jwt.io/) - Authentication tokens
- [EJS](https://ejs.co/) - Email templates
- [bcrypt](https://github.com/dcodeIO/bcrypt.js/) - Password hashing

### Community

- Inspired by the open source community
- Thanks to all contributors and users
- Special thanks to the Node.js and Express communities

---

## 📞 Support

### Getting Help

- 📧 **Email**: deepanshgangwar7037@ogmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/mr-deepansh/social-media-blog-app/issues)
- 📖 **Documentation**: This README and project wiki
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Deepansh-Gangwar/social-media-blog-app/discussions)

### Community Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/routing.html)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [JWT.io](https://jwt.io/introduction)

---

<div align="center">

**Made with ❤️ by [Deepansh Gangwar](https://github.com/mr-deepansh)**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue?style=for-the-badge&logo=github)](https://github.com/mr-deepansh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/deepansh-gangwar)

**Star this repository if it helped you! ⭐**

</div>
