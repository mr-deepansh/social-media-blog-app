// src/modules/admin/validators/super-admin.validator.js
import e from "express";
import { z } from "zod";

const createSuperAdminSchema = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(8),
	secretKey: z.string().optional(),
});

const createAdminSchema = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(8),
	role: z.enum(["admin", "super_admin"]).default("admin"),
	permissions: z.array(z.string()).optional().default([]),
});

export { createSuperAdminSchema, createAdminSchema };
