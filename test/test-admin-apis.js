// test-admin-apis.js - Quick test script for admin APIs
import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/v2";
let authToken = "";

// Complete Admin & Super Admin API endpoints for testing
const endpoints = [
  // 📊 DASHBOARD & STATS
  { method: "GET", path: "/admin/dashboard", name: "Admin Dashboard" },
  { method: "GET", path: "/admin/stats", name: "Admin Stats" },
  { method: "GET", path: "/admin/stats/live", name: "Live Admin Stats" },

  // 📈 ANALYTICS
  { method: "GET", path: "/admin/analytics/overview", name: "Analytics Overview" },
  { method: "GET", path: "/admin/analytics/users/growth", name: "User Growth Analytics" },
  { method: "GET", path: "/admin/analytics/users/retention", name: "User Retention Analytics" },
  { method: "GET", path: "/admin/analytics/users/demographics", name: "User Demographics" },
  { method: "GET", path: "/admin/analytics/engagement/metrics", name: "Engagement Metrics" },

  // 🛡️ SECURITY & MODERATION
  { method: "GET", path: "/admin/security/suspicious-accounts", name: "Suspicious Accounts" },
  { method: "GET", path: "/admin/security/login-attempts", name: "Login Attempts" },
  { method: "GET", path: "/admin/security/blocked-ips", name: "Blocked IPs" },
  {
    method: "POST",
    path: "/admin/security/blocked-ips",
    name: "Block IP Address",
    body: { ipAddress: "192.168.1.100", reason: "Security test - automated blocking", duration: "1h" },
  },
  { method: "GET", path: "/admin/security/threat-detection", name: "Threat Detection" },

  // 📝 CONTENT MANAGEMENT
  { method: "GET", path: "/admin/content/posts", name: "Get All Posts" },

  // 🎛️ SYSTEM CONFIGURATION
  { method: "GET", path: "/admin/config/app-settings", name: "App Settings" },

  // 📢 NOTIFICATIONS
  { method: "GET", path: "/admin/notifications/templates", name: "Notification Templates" },

  // 📈 PERFORMANCE MONITORING
  { method: "GET", path: "/admin/monitoring/server-health", name: "Server Health" },
  { method: "GET", path: "/admin/monitoring/database-stats", name: "Database Stats" },

  // 🔄 AUTOMATION & WORKFLOWS
  { method: "GET", path: "/admin/automation/rules", name: "Automation Rules" },

  // 🎯 A/B TESTING
  { method: "GET", path: "/admin/experiments", name: "Experiments" },

  // 🌟 BUSINESS INTELLIGENCE
  { method: "GET", path: "/admin/bi/revenue-analytics", name: "Revenue Analytics" },
  { method: "GET", path: "/admin/bi/user-lifetime-value", name: "User Lifetime Value" },

  // 👤 ADMIN MANAGEMENT
  { method: "GET", path: "/admin/admins", name: "Get All Admins" },

  // 👥 USER MANAGEMENT
  { method: "GET", path: "/admin/users", name: "Get All Users" },
  { method: "GET", path: "/admin/users/search", name: "Search Users" },
  { method: "GET", path: "/admin/users/export", name: "Export Users" },
  {
    method: "POST",
    path: "/admin/users/bulk-actions",
    name: "Bulk Actions",
    body: { action: "activate", userIds: ["507f1f77bcf86cd799439011"], dryRun: true },
  },

  // 📊 SESSION ANALYTICS
  { method: "GET", path: "/admin/sessions/analytics", name: "Session Analytics" },

  // 👑 SUPER ADMIN ENDPOINTS
  { method: "GET", path: "/admin/super-admin/admins", name: "[SA] Get All Admins" },
  { method: "GET", path: "/admin/super-admin/audit-logs", name: "[SA] Audit Logs" },
  { method: "GET", path: "/admin/super-admin/system-config", name: "[SA] System Config" },
  { method: "GET", path: "/admin/super-admin/system-health", name: "[SA] System Health" },

  // 🧪 DEBUG ENDPOINTS
  { method: "GET", path: "/admin/users/debug", name: "Debug Users" },
  { method: "GET", path: "/admin/test/users", name: "Test Users" },
  { method: "GET", path: "/admin/public-test/users", name: "Public Test Users" },
];

async function login() {
  const credentials = [
    { identifier: "superadmin", password: "SuperAdmin@123", role: "super_admin" },
    { identifier: "admin1", password: "Admin@123", role: "admin" },
    { identifier: "mr_deepansh", password: "Strong@1234", role: "user" },
  ];

  for (const cred of credentials) {
    try {
      console.log(`🔐 Trying login as ${cred.role}: ${cred.identifier}...`);

      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: cred.identifier,
          password: cred.password,
          rememberMe: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        authToken = data.data.accessToken;
        console.log(`✅ Login successful as ${cred.role}: ${cred.identifier}`);
        return true;
      } else {
        console.log(`❌ Login failed for ${cred.identifier}`);
      }
    } catch (error) {
      console.log(`❌ Login error for ${cred.identifier}:`, error.message);
    }
  }

  console.log("❌ All login attempts failed. Run: node create-admin-users.js");
  return false;
}

async function testEndpoint(endpoint) {
  try {
    const options = {
      method: endpoint.method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    };

    // Add body for POST requests
    if (endpoint.method === "POST" && endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint.path}`, options);

    // Handle different response types
    if (endpoint.path.includes("/export")) {
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: ${response.status} (Export)`);
        return true;
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status}`);
        return false;
      }
    }

    const data = await response.json();

    if (response.ok) {
      const prefix = endpoint.name.includes("[SA]") ? "👑" : "✅";
      console.log(`${prefix} ${endpoint.name}: ${response.status}`);
      return true;
    } else {
      const prefix = endpoint.name.includes("[SA]") ? "👑❌" : "❌";
      console.log(`${prefix} ${endpoint.name}: ${response.status} - ${data.message || "Unknown error"}`);
      return false;
    }
  } catch (error) {
    const prefix = endpoint.name.includes("[SA]") ? "👑❌" : "❌";
    console.log(`${prefix} ${endpoint.name}: Error - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting Admin API Tests...\n");

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("\n❌ Cannot proceed without authentication");
    console.log("\n🔧 To create admin users, run:");
    console.log("   node create-admin-users.js");
    return;
  }

  console.log("\n📊 Testing Admin APIs...\n");

  let passed = 0;
  const total = endpoints.length;

  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      passed++;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log(`\n📈 Test Results: ${passed}/${total} endpoints working`);

  if (passed === total) {
    console.log("🎉 All admin APIs are working correctly!");
  } else {
    console.log("⚠️  Some APIs need attention. Check the logs above.");
  }
}

// Run the tests
runTests().catch(console.error);

export default runTests;
