// app.constants.js
export const DB_NAME = "social-media";

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [USER_ROLES.USER]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.SUPER_ADMIN]: 3,
};

// Super Admin Permissions
export const SUPER_ADMIN_PERMISSIONS = {
  CREATE_ADMIN: "create_admin",
  DELETE_ADMIN: "delete_admin",
  MANAGE_SYSTEM: "manage_system",
  VIEW_SYSTEM_LOGS: "view_system_logs",
  MANAGE_ROLES: "manage_roles",
  SYSTEM_CONFIG: "system_config",
};
