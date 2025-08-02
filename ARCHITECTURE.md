# Social Media Blog Application

_Created by: Deepansh Gangwar_

## 📁 Project Structure

```
social-media-blog-app/
├── 📁 src/ # Source code
│   ├── 📄 server.js # Server entry point
│   ├── 📄 app.js # Main Express application
│   ├── 📁 config/ # Configuration management
│   │   ├── 📄 index.js
│   │   └── 📁 database/
│   │       └── 📄 connection.js # MongoDB connection setup
│   ├── 📁 modules/ # Feature modules
│   │ ├── 📁 admin/ # Admin module
│   │ │ ├── 📁 controllers/
│   │ │ │ └── 📄 admin.controller.js
│   │ │ ├── 📁 services/
│   │ │ │ ├── 📄 analytics.service.js
│   │ │ │ ├── 📄 audit.service.js
│   │ │ │ ├── 📄 cache.service.js
│   │ │ │ ├── 📄 exportImport.service.js
│   │ │ │ ├── 📄 notification.service.js
│   │ │ │ ├── 📄 queryBuilder.service.js
│   │ │ │ ├── 📄 security.service.js
│   │ │ │ └── 📄 validation.service.js
│   │ │ └── 📁 routes/
│   │ │ └── 📄 admin.routes.js
│   │ ├── 📁 auth/ # Authentication module
│   │ │ ├── 📁 controllers/
│   │ │ │ ├── 📄 forgotPassword.controller.js
│   │ │ │ └── 📄 resetPassword.controller.js
│   │ │ ├── 📁 routes/
│   │ │ │ ├── 📄 forgotPassword.routes.js
│   │ │ │ └── 📄 resetPassword.routes.js
│   │ │ └── 📄 index.js
│   │ ├── 📁 users/ # Users module
│   │ │ ├── 📁 controllers/
│   │ │ │ └── 📄 user.controller.js
│   │ │ ├── 📁 models/
│   │ │ │ └── 📄 user.model.js
│   │ │ ├── 📁 middleware/
│   │ │ │ ├── 📄 search.middleware.js
│   │ │ │ └── 📄 user.validation.js
│   │ │ ├── 📁 routes/
│   │ │ │ └── 📄 user.routes.js
│   │ │ └── 📄 index.js
│   │ ├── 📁 blogs/ # Blog post module
│   │ │ ├── 📁 controllers/
│   │ │ │ └── 📄 blog.controller.js
│   │ │ ├── 📁 models/
│   │ │ │ └── 📄 blog.model.js
│   │ │ ├── 📁 routes/
│   │ │ │ └── 📄 blog.routes.js
│   │ │ └── 📄 index.js
│   │ └── 📁 email/ # Email and notifications module
│   │ ├── 📁 services/
│   │ │ └── 📄 email.service.js
│   │ ├── 📁 templates/
│   │ │ └── 📄 email.templates.js
│   │ ├── 📁 utils/
│   │ │ └── 📄 sendEmail.js
│   │ ├── 📁 views/emails/
│   │ │ ├── 📄 forgot-password.ejs
│   │ │ └── 📄 password-reset-success.ejs
│   │ └── 📄 index.js
│   └── 📁 shared/ # Shared utilities and middlewares
│   ├── 📁 constants/
│   │ └── 📄 app.constants.js
│   ├── 📁 middleware/
│   │ ├── 📄 auth.middleware.js
│   │ ├── 📄 isAdmin.middleware.js
│   │ ├── 📄 multer.middleware.js
│   │ ├── 📄 rateLimit.middleware.js
│   │ ├── 📄 rbac.middleware.js
│   │ └── 📄 validate.middleware.js
│   ├── 📁 utils/
│   │ ├── 📄 ApiError.js
│   │ ├── 📄 ApiResponse.js
│   │ ├── 📄 AsyncHandler.js
│   │ └── 📄 cookieOptions.js
│   ├── 📁 validators/
│   │ ├── 📄 search.validator.js
│   │ └── 📄 zod.validator.js
│   └── 📄 index.js
├── 📁 Public/ # Static assets
│   ├── 📁 Temp/
│   │ └── 📄 .gitkeep
│   └── 📁 favicon-logo/
│   ├── 📄 logo.png
│   └── 📄 logo.svg
├── 📁 docs/ # Project documentation
│   ├── 📄 admin.control.md
│   └── 📁 postman/
│   └── 📄 social-blog-api.postman_collection.json
├── 📄 LICENSE # License file
├── 📄 README.md # Project readme
├── 📄 ROUTES_DOCUMENTATION.md # Route-by-route documentation
├── 📄 package.json # NPM configuration
├── 📄 package-lock.json # NPM lock file
├── 📄 .env.example # Sample environment variables
├── 📄 .gitignore # Git ignored files
├── 📄 .prettierignore # Prettier ignored files
├── 📄 .prettierrc # Prettier configuration
├── 📄 eslint.config.js # ESLint configuration
└── 📄 test-admin-api.ps1 # PowerShell test script
```
