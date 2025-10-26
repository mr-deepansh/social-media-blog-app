import request from "supertest";
import app from "../../src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../../src/modules/users/models/user.model.js";

dotenv.config({ path: "./.env.test" });

describe("Auth API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v2/users/register", () => {
    it("should register a new user with valid data", async () => {
      const res = await request(app).post("/api/v2/users/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("message", "User registered and logged in successfully");
      expect(res.body.data.user).toHaveProperty("username", "testuser");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/v2/users/register").send({
        username: "testuser",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app).post("/api/v2/users/register").send({
        username: "testuser",
        email: "not-an-email",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app).post("/api/v2/users/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "short",
        confirmPassword: "short",
        firstName: "Test",
        lastName: "User",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 400 if passwords do not match", async () => {
      const res = await request(app).post("/api/v2/users/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "Password123",
        confirmPassword: "Password456",
        firstName: "Test",
        lastName: "User",
      });
      expect(res.statusCode).toEqual(400);
    });

    it("should return 409 if email already exists", async () => {
      await User.create({
        username: "existinguser",
        email: "testuser@example.com",
        password: "Password123",
      });

      const res = await request(app).post("/api/v2/users/register").send({
        username: "newuser",
        email: "testuser@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(res.statusCode).toEqual(409);
    });

    it("should return 409 if username already exists", async () => {
      await User.create({
        username: "testuser",
        email: "existinguser@example.com",
        password: "Password123",
      });

      const res = await request(app).post("/api/v2/users/register").send({
        username: "testuser",
        email: "newuser@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Test",
        lastName: "User",
      });
      expect(res.statusCode).toEqual(409);
    });
  });
});
