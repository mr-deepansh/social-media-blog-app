import { sendEmail } from "../utils/sendEmail.js";
import {
	generateForgotPasswordEmail,
	generatePasswordResetSuccessEmail,
	generatePlainTextEmail,
} from "../templates/email.templates.js";

/**
 * Email Service Class
 * Handles all email operations with proper error handling and logging
 */
class EmailService {
	/**
	 * Send forgot password email
	 * @param {Object} userData - User data
	 * @param {string} userData.email - User email
	 * @param {string} userData.name - User name
	 * @param {string} resetUrl - Password reset URL
	 * @returns {Promise<Object>} - Email result
	 */
	static async sendForgotPasswordEmail(userData, resetUrl) {
		try {
			// Generate HTML email
			const htmlContent = await generateForgotPasswordEmail({
				name: userData.name,
				resetUrl: resetUrl,
			});

			// Generate plain text fallback
			const textContent = generatePlainTextEmail("forgot-password", {
				name: userData.name,
				resetUrl: resetUrl,
			});

			// Send email
			const result = await sendEmail({
				email: userData.email,
				subject: "Password Reset Request - Social Media App",
				html: htmlContent,
				text: textContent,
			});

			console.log(`✅ Forgot password email sent to ${userData.email}`);
			return { success: true, result };
		} catch (error) {
			console.error(
				`❌ Failed to send forgot password email to ${userData.email}:`,
				error,
			);
			throw new Error(`Failed to send forgot password email: ${error.message}`);
		}
	}

	/**
	 * Send password reset success email
	 * @param {Object} userData - User data
	 * @param {string} userData.email - User email
	 * @param {string} userData.name - User name
	 * @param {string} userData.username - User username
	 * @param {string} loginUrl - Login URL
	 * @returns {Promise<Object>} - Email result
	 */
	static async sendPasswordResetSuccessEmail(userData, loginUrl) {
		try {
			const resetTime = new Date().toLocaleString();

			// Generate HTML email
			const htmlContent = await generatePasswordResetSuccessEmail({
				name: userData.name,
				username: userData.username,
				email: userData.email,
				loginUrl: loginUrl,
				resetTime: resetTime,
			});

			// Generate plain text fallback
			const textContent = generatePlainTextEmail("password-reset-success", {
				name: userData.name,
				username: userData.username,
				email: userData.email,
				loginUrl: loginUrl,
				resetTime: resetTime,
			});

			// Send email
			const result = await sendEmail({
				email: userData.email,
				subject: "Password Reset Successful - Social Media App",
				html: htmlContent,
				text: textContent,
			});

			console.log(`✅ Password reset success email sent to ${userData.email}`);
			return { success: true, result };
		} catch (error) {
			console.error(
				`❌ Failed to send password reset success email to ${userData.email}:`,
				error,
			);
			throw new Error(
				`Failed to send password reset success email: ${error.message}`,
			);
		}
	}

	/**
	 * Validate email format
	 * @param {string} email - Email to validate
	 * @returns {boolean} - Is valid email
	 */
	static isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Sanitize email address
	 * @param {string} email - Email to sanitize
	 * @returns {string} - Sanitized email
	 */
	static sanitizeEmail(email) {
		return email.toLowerCase().trim();
	}

	/**
	 * Generate reset URL
	 * @param {string} token - Reset token
	 * @param {string} frontendUrl - Frontend URL
	 * @returns {string} - Complete reset URL
	 */
	static generateResetUrl(token, frontendUrl) {
		const baseUrl =
			frontendUrl || process.env.FRONTEND_URL || "http://localhost:3000";
		return `${baseUrl}/reset-password/${token}`;
	}

	/**
	 * Generate login URL
	 * @param {string} frontendUrl - Frontend URL
	 * @returns {string} - Complete login URL
	 */
	static generateLoginUrl(frontendUrl) {
		const baseUrl =
			frontendUrl || process.env.FRONTEND_URL || "http://localhost:3000";
		return `${baseUrl}/login`;
	}
}

export default EmailService;
