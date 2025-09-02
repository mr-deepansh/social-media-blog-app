// src/shared/utils/Validator.js
import { ApiError } from "./ApiError.js";

class Validator {
  /**
	 * Validate email format
	 */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
	 * Validate password strength
	 */
  static isValidPassword(password) {
    if (!password || password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!hasLowerCase) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!hasNumbers) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    return { valid: true, message: "Password is valid" };
  }

  /**
	 * Validate username format
	 */
  static isValidUsername(username) {
    if (!username || username.length < 3 || username.length > 30) {
      return {
        valid: false,
        message: "Username must be between 3 and 30 characters",
      };
    }

    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      return {
        valid: false,
        message:
					"Username can only contain letters, numbers, dots, and underscores",
      };
    }

    return { valid: true, message: "Username is valid" };
  }

  /**
	 * Sanitize input string
	 */
  static sanitizeString(input) {
    if (typeof input !== "string") {
      return "";
    }
    return input.trim().replace(/[<>]/g, "");
  }

  /**
	 * Validate required fields
	 */
  static validateRequired(fields, data) {
    const missing = [];

    for (const field of fields) {
      if (
        !data[field] ||
				(typeof data[field] === "string" && !data[field].trim())
      ) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
    }
  }

  /**
	 * Validate registration data
	 */
  static validateRegistration(data) {
    const { username, email, password, confirmPassword, firstName, lastName } =
			data;

    // Security: Remove any role-related fields from client input
    delete data.role;
    delete data.isActive;
    delete data.isAdmin;
    delete data.permissions;

    // Check required fields
    this.validateRequired(
      [
        "username",
        "email",
        "password",
        "confirmPassword",
        "firstName",
        "lastName",
      ],
      data,
    );

    // Validate email
    if (!this.isValidEmail(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    // Validate username
    const usernameValidation = this.isValidUsername(username);
    if (!usernameValidation.valid) {
      throw new ApiError(400, usernameValidation.message);
    }

    // Validate password
    const passwordValidation = this.isValidPassword(password);
    if (!passwordValidation.valid) {
      throw new ApiError(400, passwordValidation.message);
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }

    return {
      username: this.sanitizeString(username).toLowerCase(),
      email: this.sanitizeString(email).toLowerCase(),
      password,
      firstName: this.sanitizeString(firstName),
      lastName: this.sanitizeString(lastName),
    };
  }

  /**
	 * Validate login data
	 */
  static validateLogin(data) {
    const { identifier, password } = data;

    this.validateRequired(["identifier", "password"], data);

    return {
      identifier: this.sanitizeString(identifier).toLowerCase(),
      password,
    };
  }

  /**
	 * Validate pagination parameters
	 */
  static validatePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
	 * Validate MongoDB ObjectId
	 */
  static isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }
}

export { Validator };
