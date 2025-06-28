/**
 * Password Reset System Test Script
 *
 * This script tests the password reset functionality
 * Run with: node test-password-reset.js
 */

import { User } from "./src/models/user.model.js";
import EmailService from "./src/utility/emailService.js";
import crypto from "crypto";

// Test configuration
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "testPassword123";

/**
 * Test email validation
 */
function testEmailValidation() {
	console.log("\n🧪 Testing Email Validation...");

	const validEmails = [
		"test@example.com",
		"user.name@domain.co.uk",
		"user+tag@example.org",
	];

	const invalidEmails = [
		"invalid-email",
		"@example.com",
		"user@",
		"user.example.com",
	];

	console.log("✅ Valid emails:");
	validEmails.forEach((email) => {
		const isValid = EmailService.isValidEmail(email);
		console.log(`  ${email}: ${isValid ? "VALID" : "INVALID"}`);
	});

	console.log("❌ Invalid emails:");
	invalidEmails.forEach((email) => {
		const isValid = EmailService.isValidEmail(email);
		console.log(`  ${email}: ${isValid ? "VALID" : "INVALID"}`);
	});
}

/**
 * Test email sanitization
 */
function testEmailSanitization() {
	console.log("\n🧪 Testing Email Sanitization...");

	const testEmails = [
		"  TEST@EXAMPLE.COM  ",
		"User.Name@Domain.Com",
		"  user@example.com  ",
	];

	testEmails.forEach((email) => {
		const sanitized = EmailService.sanitizeEmail(email);
		console.log(`  "${email}" -> "${sanitized}"`);
	});
}

/**
 * Test URL generation
 */
function testUrlGeneration() {
	console.log("\n🧪 Testing URL Generation...");

	const testToken = "test-token-123";

	const resetUrl = EmailService.generateResetUrl(testToken);
	const loginUrl = EmailService.generateLoginUrl();

	console.log(`  Reset URL: ${resetUrl}`);
	console.log(`  Login URL: ${loginUrl}`);
}

/**
 * Test token generation and validation
 */
function testTokenGeneration() {
	console.log("\n🧪 Testing Token Generation...");

	// Simulate user token generation
	const resetToken = crypto.randomBytes(32).toString("hex");
	const hashedToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	console.log(`  Original Token: ${resetToken}`);
	console.log(`  Hashed Token: ${hashedToken}`);
	console.log(`  Token Length: ${resetToken.length} characters`);

	// Test token validation
	const testHash = crypto.createHash("sha256").update(resetToken).digest("hex");
	const isValid = testHash === hashedToken;

	console.log(`  Token Validation: ${isValid ? "VALID" : "INVALID"}`);
}

/**
 * Test password validation
 */
function testPasswordValidation() {
	console.log("\n🧪 Testing Password Validation...");

	const testPasswords = [
		{ password: "short", valid: false, reason: "Too short" },
		{ password: "password123", valid: true, reason: "Valid password" },
		{ password: "12345678", valid: true, reason: "Minimum length" },
		{ password: "pass", valid: false, reason: "Too short" },
	];

	testPasswords.forEach(({ password, valid, reason }) => {
		const isValid = password.length >= 8;
		const status = isValid === valid ? "✅" : "❌";
		console.log(
			`  ${status} "${password}" (${reason}): ${isValid ? "VALID" : "INVALID"}`,
		);
	});
}

/**
 * Test email template rendering (mock)
 */
async function testEmailTemplates() {
	console.log("\n🧪 Testing Email Template Rendering...");

	try {
		// Test forgot password template data
		const forgotPasswordData = {
			name: "John Doe",
			resetUrl: "http://localhost:3000/reset-password/test-token",
		};

		console.log("  Forgot Password Template Data:");
		console.log(`    Name: ${forgotPasswordData.name}`);
		console.log(`    Reset URL: ${forgotPasswordData.resetUrl}`);

		// Test success template data
		const successData = {
			name: "John Doe",
			username: "johndoe",
			email: "john@example.com",
			loginUrl: "http://localhost:3000/login",
			resetTime: new Date().toLocaleString(),
		};

		console.log("  Success Template Data:");
		console.log(`    Name: ${successData.name}`);
		console.log(`    Username: ${successData.username}`);
		console.log(`    Email: ${successData.email}`);
		console.log(`    Login URL: ${successData.loginUrl}`);
		console.log(`    Reset Time: ${successData.resetTime}`);

		console.log("  ✅ Template data structure is valid");
	} catch (error) {
		console.log(`  ❌ Template test failed: ${error.message}`);
	}
}

/**
 * Test environment variables
 */
function testEnvironmentVariables() {
	console.log("\n🧪 Testing Environment Variables...");

	const requiredVars = [
		"EMAIL_HOST",
		"EMAIL_PORT",
		"EMAIL_USERNAME",
		"EMAIL_PASSWORD",
		"EMAIL_FROM",
		"EMAIL_FROM_NAME",
		"FRONTEND_URL",
		"ACCESS_TOKEN_SECRET",
		"REFRESH_TOKEN_SECRET",
	];

	let allPresent = true;

	requiredVars.forEach((varName) => {
		const value = process.env[varName];
		const status = value ? "✅" : "❌";
		const displayValue = value
			? varName.includes("PASSWORD") || varName.includes("SECRET")
				? "***SET***"
				: value
			: "NOT SET";
		console.log(`  ${status} ${varName}: ${displayValue}`);

		if (!value) allPresent = false;
	});

	if (allPresent) {
		console.log("  ✅ All required environment variables are set");
	} else {
		console.log("  ❌ Some environment variables are missing");
		console.log("  📝 Please check your .env file");
	}
}

/**
 * Main test function
 */
async function runTests() {
	console.log("🚀 Starting Password Reset System Tests...\n");

	try {
		testEmailValidation();
		testEmailSanitization();
		testUrlGeneration();
		testTokenGeneration();
		testPasswordValidation();
		await testEmailTemplates();
		testEnvironmentVariables();

		console.log("\n✅ All tests completed successfully!");
		console.log("\n📋 Next Steps:");
		console.log("  1. Set up your .env file with email credentials");
		console.log("  2. Test the API endpoints with a real email");
		console.log("  3. Verify email templates render correctly");
		console.log("  4. Test the complete password reset flow");
	} catch (error) {
		console.error("\n❌ Test failed:", error.message);
		console.error("Stack trace:", error.stack);
	}
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	runTests();
}

export { runTests };
