const request = require("supertest");
const app = require("../src/server");

describe("Admin API Tests", () => {
  let jwtToken;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: "admin@example.com",
        password: "Strong@123",
      });
    jwtToken = res.body.data.accessToken;
  });

  test("Get all admins - should return a list of admins", async () => {
    const res = await request(app)
      .get("/api/v1/admin/admins")
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("Get admin by ID - should return admin details", async () => {
    const res = await request(app)
      .get("/api/v1/admin/admins/123456789012345678901234")
      .set("Authorization", `Bearer ${jwtToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("id", "123456789012345678901234");
  });

  // Add more tests for other endpoints

});

