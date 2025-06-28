// ========================================
// AUTH MODULE - INDEX FILE
// ========================================
// Centralized exports for authentication module

// Controllers
export { default as forgotPasswordController } from "./controllers/forgotPassword.controller.js";
export { default as resetPasswordController } from "./controllers/resetPassword.controller.js";

// Routes
export { default as forgotPasswordRoutes } from "./routes/forgotPassword.routes.js";
export { default as resetPasswordRoutes } from "./routes/resetPassword.routes.js";

// Services (if any)
// export { default as authService } from './services/auth.service.js';

// Middleware (if any)
// export { default as authMiddleware } from './middleware/auth.middleware.js';
