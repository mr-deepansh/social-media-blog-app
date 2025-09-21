// src/shared/constants/index.js

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

// Activity Types
export const ACTIVITY_TYPES = {
  LOGIN: "login",
  LOGOUT: "logout",
  REGISTER: "register",
  PASSWORD_RESET: "password_reset",
  PROFILE_UPDATE: "profile_update",
  EMAIL_CHANGE: "email_change",
};

// Security Constants
export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  PASSWORD_HISTORY_LIMIT: 5,
  PASSWORD_RESET_EXPIRY: 15 * 60 * 1000, // 15 minutes
  EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  JWT_ACCESS_EXPIRY: "1d",
  JWT_REFRESH_EXPIRY: "30d",
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload Constants
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  UPLOAD_PATHS: {
    AVATARS: "uploads/avatars",
    COVERS: "uploads/covers",
    POSTS: "uploads/posts",
  },
};

// Cache Constants
export const CACHE = {
  DEFAULT_TTL: 3600, // 1 hour
  USER_PROFILE_TTL: 1800, // 30 minutes
  FEED_TTL: 300, // 5 minutes
};

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5, // for login/register
};

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  LOGIN_NOTIFICATION: "login-notification",
  PASSWORD_RESET: "password-reset",
  PASSWORD_RESET_CONFIRMATION: "password-reset-confirmation",
};

// Validation Rules
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
};
