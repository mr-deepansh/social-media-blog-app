# Login System Usage Examples

## Updated Login System

The login system now accepts either **username** or **email** along with password using a single `identifier` field.

## API Endpoint

```
POST /api/v1/users/login
```

## Request Format

### Using Username

```json
{
	"identifier": "john_doe",
	"password": "yourPassword123",
	"rememberMe": false
}
```

### Using Email with Remember Me

```json
{
	"identifier": "john@example.com",
	"password": "yourPassword123",
	"rememberMe": true
}
```

## Frontend Examples

### JavaScript/Fetch

```javascript
const loginUser = async (identifier, password, rememberMe = false) => {
	try {
		const response = await fetch("/api/v1/users/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				identifier: identifier, // Can be username or email
				password: password,
				rememberMe: rememberMe,
			}),
		});

		const data = await response.json();

		if (data.success) {
			console.log("Login successful:", data.data.user);
			// Store tokens if needed
			localStorage.setItem("accessToken", data.data.accessToken);
		} else {
			console.error("Login failed:", data.message);
		}
	} catch (error) {
		console.error("Login error:", error);
	}
};

// Usage examples
loginUser("john_doe", "password123", false); // Login with username
loginUser("john@example.com", "password123", true); // Login with email + Remember Me
```

### React Hook Example

```jsx
import { useState } from "react";

const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const login = async (identifier, password, rememberMe = false) => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/v1/users/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ identifier, password, rememberMe }),
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.message);
			}

			return data.data;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return { login, loading, error };
};

// Usage in component
const LoginForm = () => {
	const { login, loading, error } = useLogin();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const result = await login(identifier, password, rememberMe);
			console.log("Logged in:", result.user);
		} catch (err) {
			console.error("Login failed:", err.message);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Username or Email"
				value={identifier}
				onChange={(e) => setIdentifier(e.target.value)}
				required
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			<label>
				<input
					type="checkbox"
					checked={rememberMe}
					onChange={(e) => setRememberMe(e.target.checked)}
				/>
				Remember Me
			</label>
			<button type="submit" disabled={loading}>
				{loading ? "Logging in..." : "Login"}
			</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
};
```

## cURL Examples

### Login with Username

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john_doe",
    "password": "yourPassword123",
    "rememberMe": false
  }'
```

### Login with Email + Remember Me

```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "yourPassword123",
    "rememberMe": true
  }'
```

## Success Response

```json
{
	"statusCode": 200,
	"data": {
		"user": {
			"_id": "64f8a1b2c3d4e5f6a7b8c9d0",
			"username": "john_doe",
			"email": "john@example.com",
			"firstName": "John",
			"lastName": "Doe",
			"avatar": "/assets/default-avatar.png",
			"bio": "Hello, I'm John!",
			"isActive": true,
			"createdAt": "2024-01-15T10:30:00.000Z"
		},
		"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	},
	"message": "User logged in successfully",
	"success": true
}
```

## Error Response

```json
{
	"statusCode": 401,
	"data": null,
	"message": "Invalid credentials",
	"success": false
}
```

## Key Features

✅ **Flexible Input**: Accept either username or email  
✅ **Single Field**: Use one `identifier` field instead of separate username/email fields  
✅ **Remember Me**: Extended session duration when checkbox is checked  
✅ **Secure**: Password validation and JWT token generation  
✅ **Simple**: Clean and minimal implementation  
✅ **Consistent**: Same response format for all cases

## Remember Me Feature

- **Default**: Cookies expire in **1 day**
- **Remember Me**: Cookies expire in **30 days**
- **Optional**: `rememberMe` field defaults to `false` if not provided

## Migration from Old System

If you were using separate `username` and `email` fields before:

### Old Format ❌

```json
{
	"username": "john_doe", // OR
	"email": "john@example.com",
	"password": "password123"
}
```

### New Format ✅

```json
{
	"identifier": "john_doe", // Can be username OR email
	"password": "password123",
	"rememberMe": true // Optional: extends session duration
}
```

This makes the login form simpler and more user-friendly!
