// src/shared/middleware/csrf.middleware.js
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Get CSRF token from header or body
  const token = req.headers["x-csrf-token"] || req.body._csrf;

  // Get expected token from session or cookie
  const expectedToken = req.session?.csrfToken || req.cookies?.csrfToken;

  if (!token || !expectedToken) {
    throw new ApiError(403, "CSRF token missing");
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) {
    throw new ApiError(403, "Invalid CSRF token");
  }

  next();
};

// Middleware to set CSRF token in response
export const setCSRFToken = (req, res, next) => {
  const token = generateCSRFToken();

  // Set in cookie (HttpOnly for security)
  res.cookie("csrfToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Also set in session if available
  if (req.session) {
    req.session.csrfToken = token;
  }

  // Provide token to client via header for AJAX requests
  res.set("X-CSRF-Token", token);

  next();
};
