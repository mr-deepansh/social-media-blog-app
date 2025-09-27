// create-admin-users.js - Create admin and super_admin users
import mongoose from "mongoose";
import { User } from "../src/modules/users/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const adminUsers = [
  {
    username: "superadmin",
    email: "superadmin@example.com",
    password: "SuperAdmin@123",
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    isActive: true,
    isEmailVerified: true,
  },
  {
    username: "admin1",
    email: "admin1@example.com",
    password: "Admin@123",
    firstName: "Admin",
    lastName: "One",
    role: "admin",
    isActive: true,
    isEmailVerified: true,
  },
  {
    username: "admin2",
    email: "admin2@example.com",
    password: "Admin@123",
    firstName: "Admin",
    lastName: "Two",
    role: "admin",
    isActive: true,
    isEmailVerified: true,
  },
];

async function createAdminUsers() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("👑 Creating admin users...");

    for (const adminData of adminUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ username: adminData.username }, { email: adminData.email }],
        });

        if (existingUser) {
          console.log(`⚠️  User ${adminData.username} already exists`);
          continue;
        }

        // Create new admin user
        const newAdmin = new User(adminData);
        await newAdmin.save();

        console.log(`✅ Created ${adminData.role}: ${adminData.username} (${adminData.email})`);
      } catch (error) {
        console.error(`❌ Failed to create ${adminData.username}:`, error.message);
      }
    }

    console.log("\n📊 Current admin users in database:");
    const admins = await User.find({
      role: { $in: ["admin", "super_admin"] },
    }).select("username email role isActive");

    admins.forEach(admin => {
      const status = admin.isActive ? "✅" : "❌";
      const roleIcon = admin.role === "super_admin" ? "👑" : "🔧";
      console.log(`${status} ${roleIcon} ${admin.username} (${admin.email}) - ${admin.role}`);
    });

    console.log("\n🎯 Login credentials for testing:");
    console.log("Super Admin: superadmin / SuperAdmin@123");
    console.log("Admin 1: admin1 / Admin@123");
    console.log("Admin 2: admin2 / Admin@123");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createAdminUsers();
