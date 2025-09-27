// test-system-apis.js - System, Performance & Security API Testing
import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/v2";
let authToken = "";

// System, Performance & Security API endpoints
const systemEndpoints = [
  // 🔧 SYSTEM HEALTH & MONITORING
  { method: "GET", path: "/admin/monitoring/server-health", name: "🔧 Server Health", category: "system" },
  { method: "GET", path: "/admin/monitoring/database-stats", name: "🔧 Database Stats", category: "system" },
  { method: "GET", path: "/admin/super-admin/system-health", name: "👑 System Health (SA)", category: "system" },
  { method: "GET", path: "/admin/super-admin/system-config", name: "👑 System Config (SA)", category: "system" },
  {
    method: "PUT",
    path: "/admin/super-admin/system-config",
    name: "👑 Update System Config (SA)",
    category: "system",
    body: { maintenance: { enabled: false, message: "System maintenance" } },
  },

  // ⚡ PERFORMANCE MONITORING
  { method: "GET", path: "/admin/stats", name: "⚡ Admin Stats Performance", category: "performance" },
  { method: "GET", path: "/admin/stats/live", name: "⚡ Live Stats Performance", category: "performance" },
  { method: "GET", path: "/admin/sessions/analytics", name: "⚡ Session Analytics", category: "performance" },
  { method: "GET", path: "/admin/analytics/overview", name: "⚡ Analytics Overview", category: "performance" },

  // 🛡️ SECURITY MONITORING
  { method: "GET", path: "/admin/security/suspicious-accounts", name: "🛡️ Suspicious Accounts", category: "security" },
  { method: "GET", path: "/admin/security/login-attempts", name: "🛡️ Login Attempts", category: "security" },
  { method: "GET", path: "/admin/security/blocked-ips", name: "🛡️ Blocked IPs", category: "security" },
  { method: "GET", path: "/admin/security/threat-detection", name: "🛡️ Threat Detection", category: "security" },
  {
    method: "POST",
    path: "/admin/security/blocked-ips",
    name: "🛡️ Block IP",
    category: "security",
    body: { ipAddress: "192.168.1.100", reason: "Security test", duration: "1h" },
  },

  // 🚨 EMERGENCY & CRITICAL OPERATIONS
  { method: "GET", path: "/admin/super-admin/audit-logs", name: "🚨 Audit Logs (SA)", category: "security" },
  {
    method: "POST",
    path: "/admin/super-admin/emergency-lockdown",
    name: "🚨 Emergency Lockdown (SA)",
    category: "security",
    body: {
      reason: "Security test - emergency lockdown for system maintenance and security validation",
      duration: "5m",
      confirmPassword: "SuperAdmin@123",
    },
  },

  // 📊 SYSTEM ANALYTICS
  { method: "GET", path: "/admin/analytics/users/growth", name: "📊 User Growth Analytics", category: "analytics" },
  { method: "GET", path: "/admin/analytics/users/demographics", name: "📊 User Demographics", category: "analytics" },
  { method: "GET", path: "/admin/analytics/engagement/metrics", name: "📊 Engagement Metrics", category: "analytics" },

  // 🔍 DEBUG & TESTING
  { method: "GET", path: "/admin/users/debug", name: "🔍 Debug Users", category: "debug" },
  { method: "GET", path: "/admin/test/users", name: "🔍 Test Users", category: "debug" },
  { method: "GET", path: "/admin/public-test/users", name: "🔍 Public Test Users", category: "debug" },
  { method: "GET", path: "/health", name: "🔍 Health Check", category: "debug" },
  { method: "GET", path: "/status", name: "🔍 API Status", category: "debug" },
];

async function login() {
  const credentials = [
    { identifier: "superadmin", password: "SuperAdmin@123", role: "super_admin" },
    { identifier: "admin1", password: "Admin@123", role: "admin" },
  ];

  for (const cred of credentials) {
    try {
      console.log(`🔐 Trying login as ${cred.role}: ${cred.identifier}...`);

      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      }
    } catch (error) {
      console.log(`❌ Login error for ${cred.identifier}:`, error.message);
    }
  }

  console.log("❌ All login attempts failed. Run: node create-admin-users.js");
  return false;
}

async function testEndpoint(endpoint) {
  const startTime = Date.now();

  try {
    const options = {
      method: endpoint.method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    };

    if (endpoint.method === "POST" && endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    if (endpoint.method === "PUT" && endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint.path}`, options);
    const responseTime = Date.now() - startTime;

    // Performance grading
    let perfGrade = "🔴";
    if (responseTime < 100) {
      perfGrade = "🟢";
    } else if (responseTime < 300) {
      perfGrade = "🟡";
    } else if (responseTime < 1000) {
      perfGrade = "🟠";
    }

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint.name}: ${response.status} ${perfGrade} ${responseTime}ms`);

      // Log additional info for system endpoints
      if (endpoint.category === "system" && data.data) {
        if (data.data.serverHealth) {
          console.log(`   📊 CPU: ${data.data.serverHealth.cpu}%, Memory: ${data.data.serverHealth.memory}%`);
        }
        if (data.data.database) {
          console.log(`   💾 DB Status: ${data.data.database.status}, Collections: ${data.data.database.collections}`);
        }
      }

      return { success: true, responseTime, status: response.status };
    } else {
      const data = await response.json().catch(() => ({ message: "Unknown error" }));
      console.log(`❌ ${endpoint.name}: ${response.status} ${perfGrade} ${responseTime}ms - ${data.message}`);
      return { success: false, responseTime, status: response.status, error: data.message };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ ${endpoint.name}: Error 🔴 ${responseTime}ms - ${error.message}`);
    return { success: false, responseTime, error: error.message };
  }
}

async function runSystemTests() {
  console.log("🚀 Starting System, Performance & Security API Tests...\n");

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("\n❌ Cannot proceed without authentication");
    console.log("\n🔧 To create admin users, run:");
    console.log("   node create-admin-users.js");
    return;
  }

  console.log("\n🔧 Testing System APIs...\n");

  const results = {
    system: { passed: 0, total: 0, avgTime: 0 },
    performance: { passed: 0, total: 0, avgTime: 0 },
    security: { passed: 0, total: 0, avgTime: 0 },
    analytics: { passed: 0, total: 0, avgTime: 0 },
    debug: { passed: 0, total: 0, avgTime: 0 },
    overall: { passed: 0, total: 0, avgTime: 0 },
  };

  for (const endpoint of systemEndpoints) {
    const result = await testEndpoint(endpoint);

    // Update category stats
    const category = endpoint.category;
    results[category].total++;
    results.overall.total++;

    if (result.success) {
      results[category].passed++;
      results.overall.passed++;
    }

    results[category].avgTime += result.responseTime;
    results.overall.avgTime += result.responseTime;

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Calculate averages
  Object.keys(results).forEach(key => {
    if (results[key].total > 0) {
      results[key].avgTime = Math.round(results[key].avgTime / results[key].total);
    }
  });

  console.log("\n📊 SYSTEM TEST RESULTS:");
  console.log("=".repeat(50));

  Object.entries(results).forEach(([category, stats]) => {
    if (stats.total > 0) {
      const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
      const icon =
				category === "overall"
					? "🎯"
					: category === "system"
						? "🔧"
						: category === "performance"
							? "⚡"
							: category === "security"
								? "🛡️"
								: category === "analytics"
									? "📊"
									: "🔍";

      console.log(
				`${icon} ${category.toUpperCase()}: ${stats.passed}/${stats.total} (${successRate}%) - Avg: ${stats.avgTime}ms`,
      );
    }
  });

  console.log("\n🎯 PERFORMANCE ANALYSIS:");
  console.log("🟢 Excellent: <100ms | 🟡 Good: <300ms | 🟠 Fair: <1000ms | 🔴 Poor: >1000ms");

  if (results.overall.passed === results.overall.total) {
    console.log("\n🎉 All system APIs are working correctly!");
  } else {
    console.log("\n⚠️  Some system APIs need attention. Check the logs above.");
  }

  console.log("\n🔧 SYSTEM HEALTH SUMMARY:");
  console.log(`✅ API Availability: ${((results.overall.passed / results.overall.total) * 100).toFixed(1)}%`);
  console.log(`⚡ Average Response Time: ${results.overall.avgTime}ms`);
  console.log(`🛡️ Security Endpoints: ${results.security.passed}/${results.security.total} working`);
  console.log(`🔧 System Endpoints: ${results.system.passed}/${results.system.total} working`);
}

runSystemTests().catch(console.error);

export default runSystemTests;
