## **All routes are now properly configured and ready for testing!**

```
social-media-blog-app/
├── 📁 src/                             # Source code
│   ├── 📄 app.js                       # Main Express application
│   ├── 📄 server.js                    # Server entry point
│   ├── 📁 config/                      # Configuration management
│   │   ├── 📄 index.js                 # Main configuration exports
│   │   ├── 📁 database/
│   │   │   └── 📄 connection.js        # Database connection
│   │   ├── 📁 email/
│   │   │   └── 📄 (email config)
│   │   └── 📁 security/
│   │       └── 📄 (security settings)
│   ├── 📁 modules/                     # Feature modules
│   │   ├── 📁 admin/                   # Admin module
│   │   │   ├── 📁 controllers/
│   │   │   │   └── 📄 admin.controller.js
│   │   │   ├── 📁 services/
│   │   │   │   └── 📄 (admin services)
│   │   │   └── 📁 routes/
│   │   │       └── 📄 admin.routes.js
│   │   ├── 📁 auth/                    # Authentication module
│   │   │   ├── 📁 controllers/
│   │   │   │   ├── 📄 forgotPassword.controller.js
│   │   │   │   └── 📄 resetPassword.controller.js
│   │   │   ├── 📁 services/
│   │   │   │   └── 📄 (auth services)
│   │   │   ├── 📁 routes/
│   │   │   │   ├── 📄 forgotPassword.routes.js
│   │   │   │   └── 📄 resetPassword.routes.js
│   │   │   └── 📄 index.js
│   │   ├── 📁 users/                   # Users module
│   │   │   ├── 📁 controllers/
│   │   │   │   └── 📄 user.controller.js
│   │   │   ├── 📁 models/
│   │   │   │   └── 📄 user.model.js
│   │   │   ├── 📁 middleware/
│   │   │   │   └── 📄 (user middlewares)
│   │   │   ├── 📁 services/
│   │   │   │   └── 📄 (user services)
│   │   │   ├── 📁 routes/
│   │   │   │   └── 📄 user.routes.js
│   │   │   └── 📄 index.js
│   │   ├── 📁 blogs/                   # Blogs module
│   │   │   ├── 📁 controllers/
│   │   │   │   └── 📄 blog.controller.js
│   │   │   ├── 📁 models/
│   │   │   │   └── 📄 blog.model.js
│   │   │   ├── 📁 middleware/
│   │   │   │   └── 📄 (blog middleware)
│   │   │   ├── 📁 services/
│   │   │   │   └── 📄 (blog services)
│   │   │   ├── 📁 routes/
│   │   │   │   └── 📄 blog.routes.js
│   │   │   └── 📄 index.js
│   │   └── 📁 email/                   # Email module
│   │       ├── 📁 services/
│   │       │   └── 📄 email.service.js
│   │       ├── 📁 templates/
│   │       │   └── 📄 email.templates.html
│   │       ├── 📁 utils/
│   │       │   └── 📄 sendEmail.js
│   │       ├── 📁 views/emails/
│   │       │   ├── 📄 forgot-password.ejs
│   │       │   ├── 📄 password-reset-success.ejs
│   │       └── 📄 index.js
│   └── 📁 shared/                      # Shared utilities
│       ├── 📁 constants/
│       │   └── 📄 app.constants.js
│       ├── 📁 middleware/
│       │   ├── 📄 auth.middleware.js
│       │   ├── 📄 isAdmin.middleware.js
│       │   ├── 📄 rateLimit.middleware.js
│       │   └── 📄 validate.middleware.js
│       ├── 📁 types/
│       │   └── 📄 (shared types)
│       ├── 📁 utils/
│       │   ├── 📄 ApiError.js
│       │   ├── 📄 AsyncHandler.js
│       │   ├── 📄 ApiResponse.js
│       │   └── 📄 cookieOptions.js
│       ├── 📁 validators/
│       │   └── 📄 user.validator.js
│       └── 📄 index.js
├── 📁 docs/                            # Documentation
│   ├── 📄 API.md
│   ├── 📄 INSTALLATION.md
│   ├── 📄 DEPLOYMENT.md
│   ├── 📄 CONTRIBUTING.md
│   ├── 📄 ARCHITECTURE.md
│   └── 📁 postman/
│       └── 📄 social-blog-api.postman_collection.json
├── 📄 .gitignore                       # Git exclusions
├── 📄 .env.example                     # Environment template
├── 📄 .eslintrc.js                     # ESLint configuration
├── 📄 .prettierrc                      # Prettier configuration
├── 📄 package.json                     # Project configuration
├── 📄 package-lock.json                # Dependency lock file
├── 📄 Dockerfile                       # Docker configuration
├── 📄 docker-compose.yml              # Docker services
├── 📄 docker-compose.dev.yml          # Development Docker services
├── 📄 .dockerignore                    # Docker ignore file
└── 📄 README.md                        # Project documentation

```
