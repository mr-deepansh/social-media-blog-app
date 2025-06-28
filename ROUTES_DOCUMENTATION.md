# API Routes Documentation

## 🚀 Base URL

```
http://localhost:5000
```

## 📋 Available Routes

### 🔐 Authentication Routes

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

### 👥 User Routes

```http
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### 📝 Blog Routes

```http
GET    /api/v1/blogs
POST   /api/v1/blogs
GET    /api/v1/blogs/:id
PUT    /api/v1/blogs/:id
DELETE /api/v1/blogs/:id
```

### 🏥 Health Check Routes

```http
GET /
GET /api/v1
```

## 🔧 Updated Route Structure

### Before (Old Structure):

```
POST /api/v1/forget-password/forget-password
POST /api/v1/reset-password/:token
```

### After (New Structure):

```
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password/:token
```

## 🧪 Testing Updated Routes

### Using cURL:

#### 1. Forgot Password (Updated URL):

```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

#### 2. Reset Password (Updated URL):

```bash
curl -X POST http://localhost:5000/api/v1/auth/reset-password/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newSecurePassword123",
    "confirmPassword": "newSecurePassword123"
  }'
```

## 📊 Route Summary Table

| Method | Route                                | Description       | Access  |
| ------ | ------------------------------------ | ----------------- | ------- |
| GET    | `/`                                  | Health check      | Public  |
| GET    | `/api/v1`                            | API version check | Public  |
| POST   | `/api/v1/auth/forgot-password`       | Send reset email  | Public  |
| POST   | `/api/v1/auth/reset-password/:token` | Reset password    | Public  |
| GET    | `/api/v1/users`                      | Get all users     | Private |
| POST   | `/api/v1/users`                      | Create user       | Public  |
| GET    | `/api/v1/users/:id`                  | Get user by ID    | Private |
| PUT    | `/api/v1/users/:id`                  | Update user       | Private |
| DELETE | `/api/v1/users/:id`                  | Delete user       | Private |
| GET    | `/api/v1/blogs`                      | Get all blogs     | Public  |
| POST   | `/api/v1/blogs`                      | Create blog       | Private |
| GET    | `/api/v1/blogs/:id`                  | Get blog by ID    | Public  |
| PUT    | `/api/v1/blogs/:id`                  | Update blog       | Private |
| DELETE | `/api/v1/blogs/:id`                  | Delete blog       | Private |

## 🚀 Quick Start

1. **Start Server:**

   ```bash
   npm run dev
   ```

2. **Test Health Check:**

   ```bash
   curl http://localhost:5000/api/v1
   ```

3. **Test Forgot Password:**

   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "your-email@example.com"}'
   ```

4. **Test Reset Password:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/reset-password/TOKEN \
     -H "Content-Type: application/json" \
     -d '{"newPassword": "newPass123", "confirmPassword": "newPass123"}'
   ```

All routes are now properly configured and ready for testing!
