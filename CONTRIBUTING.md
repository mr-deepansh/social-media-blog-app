# Contributing to EndlessChatt

🎉 Thank you for your interest in contributing to **EndlessChatt** - the next-generation social media platform! This
guide provides comprehensive guidelines for contributors to maintain code quality and project standards.

## 🎯 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites

| Requirement  | Version | Purpose                        |
| ------------ | ------- | ------------------------------ |
| **Node.js**  | 20+     | Runtime environment            |
| **MongoDB**  | 8.0+    | Primary database               |
| **Redis**    | 7.0+    | Caching & sessions             |
| **Docker**   | 20+     | Containerization (recommended) |
| **Git**      | Latest  | Version control                |
| **npm/yarn** | Latest  | Package management             |

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone :mr-deepansh/social-media-blog-app.git
   cd social-media-blog-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   cd shared && npm install && cd ..
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development**
   ```bash
   docker-compose up -d  # Start databases
   npm run dev           # Start all services
   ```

## 📋 Development Guidelines

### Coding Standards

- **Language**: JavaScript ES6+ with modules
- **Style Guide**: Airbnb ESLint configuration
- **Formatting**: Prettier with 2-space indentation
- **Documentation**: JSDoc for all functions and classes

### File Naming Conventions

```
# Controllers
user.controller.js
blog.controller.js

# Services
user.service.js
email.service.js

# Models
user.model.js
blog.model.js

# Routes
user.routes.js
auth.routes.js

# Middleware
auth.middleware.js
validation.middleware.js

# Utilities
api-response.util.js
logger.util.js

# Constants
http-status.constant.js
app.constant.js
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

| Type       | Description        | Example                                     |
| ---------- | ------------------ | ------------------------------------------- |
| `feat`     | New feature        | `feat(chat): add real-time messaging`       |
| `fix`      | Bug fix            | `fix(auth): resolve token expiration issue` |
| `docs`     | Documentation      | `docs(api): update endpoint specifications` |
| `style`    | Code formatting    | `style: apply prettier formatting`          |
| `refactor` | Code restructuring | `refactor(user): optimize profile queries`  |
| `test`     | Testing            | `test(auth): add unit tests for login`      |
| `chore`    | Maintenance        | `chore: update dependencies`                |
| `perf`     | Performance        | `perf(db): optimize user search queries`    |
| `ci`       | CI/CD changes      | `ci: add automated testing workflow`        |

#### Scope Examples

- `auth` - Authentication system
- `user` - User management
- `chat` - Messaging features
- `admin` - Admin dashboard
- `api` - API endpoints
- `ui` - User interface
- `db` - Database operations

## 🧪 Testing

### Test Requirements

| Test Type             | Requirement            | Coverage Target |
| --------------------- | ---------------------- | --------------- |
| **Unit Tests**        | All new functions      | 90%+            |
| **Integration Tests** | All API endpoints      | 85%+            |
| **E2E Tests**         | Critical user flows    | 100%            |
| **Performance Tests** | High-traffic endpoints | Key metrics     |
| **Security Tests**    | Authentication flows   | 100%            |

#### Testing Standards

- Write tests before implementing features (TDD)
- Use descriptive test names
- Mock external dependencies
- Test both success and failure scenarios
- Include edge cases and boundary conditions

### Running Tests

```bash
# All tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Writing Tests

```javascript
// Example unit test
describe("UserService", () => {
  describe("createUser", () => {
    it("should create a new user with valid data", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "SecurePass123!",
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });
  });
});
```

## 🏗️ Architecture Guidelines

### Microservice Structure

Each service should follow this structure:

```
service-name/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middleware/      # Service-specific middleware
│   ├── validators/      # Input validation
│   ├── utils/           # Utility functions
│   ├── config/          # Service configuration
│   └── constants/       # Service constants
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── Dockerfile
├── package.json
└── README.md
```

### API Design Principles

1. **RESTful**: Follow REST conventions
2. **Consistent**: Use standardized response formats
3. **Versioned**: Include API version in URLs (`/api/v2/`)
4. **Documented**: Comprehensive API documentation
5. **Secure**: Authentication and authorization on all endpoints

### Error Handling

Use the shared error utilities:

```javascript
import { ApiError } from "@shared/lib/utils/api-error.util.js";

// Throw standardized errors
throw ApiError.badRequest("Invalid input data");
throw ApiError.unauthorized("Authentication required");
throw ApiError.notFound("User not found");
```

### Response Format

Use the shared response utilities:

```javascript
import { ApiResponse } from "@shared/lib/utils/api-response.util.js";

// Success responses
return ApiResponse.success(data, "Operation successful").send(res);
return ApiResponse.created(user, "User created successfully").send(res);

// Paginated responses
return ApiResponse.paginated(items, pagination).send(res);
```

## 🔍 Code Review Process

### Pull Request Guidelines

1. **Branch Naming**: Use descriptive branch names

   ```
   feature/user-authentication
   fix/blog-validation-error
   docs/api-documentation-update
   ```

2. **PR Description**: Include:
   - Clear description of changes
   - Related issue numbers
   - Testing instructions
   - Screenshots (if UI changes)

3. **PR Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated and passing
   - [ ] Documentation updated
   - [ ] No breaking changes (or properly documented)
   - [ ] Security considerations addressed

### Review Criteria

- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security vulnerabilities?
- **Testing**: Are tests comprehensive and meaningful?
- **Documentation**: Is the code properly documented?

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Gather relevant information

### Bug Report Template

```markdown
**Bug Description** A clear description of the bug.

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior** What you expected to happen.

**Actual Behavior** What actually happened.

**Environment**

- OS: [e.g., Windows 10, macOS 12.0]
- Node.js version: [e.g., 20.0.0]
- Browser: [e.g., Chrome 96.0]

**Additional Context** Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description** A clear description of the feature you'd like to see.

**Problem Statement** What problem does this feature solve?

**Proposed Solution** How would you like this feature to work?

**Alternatives Considered** Any alternative solutions you've considered.

**Additional Context** Any other context or screenshots about the feature.
```

## 📚 Documentation

### Documentation Standards

- **API Documentation**: OpenAPI/Swagger specifications
- **Code Documentation**: JSDoc comments for all public functions
- **Architecture Documentation**: High-level system design
- **User Documentation**: Clear setup and usage instructions

### Documentation Updates

When making changes that affect:

- **API**: Update OpenAPI specs and Postman collections
- **Configuration**: Update environment variable documentation
- **Architecture**: Update architecture diagrams and documentation
- **Features**: Update user-facing documentation

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes prepared

## 🤝 Community

### Getting Help

| Channel                | Purpose                                                                   | Response Time |
| ---------------------- | ------------------------------------------------------------------------- | ------------- |
| **GitHub Issues**      | Bug reports & feature requests                                            | 24-48 hours   |
| **GitHub Discussions** | Questions & general discussion                                            | 1-3 days      |
| **Discord**            | Real-time community chat                                                  | Immediate     |
| **Email**              | [deepanshgangwar7037@outlook.com](mailto:deepanshgangwar7037@outlook.com) | 2-5 days      |

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Provide constructive feedback
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

### Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

## 🌟 Recognition

Contributors are recognized through:

- **Contributors Hall of Fame** in README.md
- **Monthly Contributor Spotlight** in releases
- **Special Discord roles** for active contributors
- **Swag and merchandise** for significant contributions

---

**Thank you for making EndlessChatt better! 🚀**

_Together, we're building the future of social communication._
