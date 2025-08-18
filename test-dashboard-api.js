// test-dashboard-api.js - Test the new dashboard API
import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/v1";

// Test configuration
const testConfig = {
	adminToken: "your_admin_jwt_token_here", // Replace with actual admin token
	endpoints: ["/admin/dashboard", "/admin/sessions/analytics", "/admin/stats"],
};

async function testDashboardAPI() {
	console.log("🚀 Testing Admin Dashboard API...\n");

	for (const endpoint of testConfig.endpoints) {
		try {
			console.log(`📊 Testing: ${endpoint}`);

			const response = await fetch(`${BASE_URL}${endpoint}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${testConfig.adminToken}`,
					"Content-Type": "application/json",
					"x-session-id": `test_session_${Date.now()}`,
				},
			});

			const data = await response.json();

			if (response.ok) {
				console.log("✅ Success:", response.status);

				// Check for required response structure
				if (data.data) {
					console.log("📈 Response Structure:");

					if (data.data.engagement) {
						console.log(
							"   - Engagement:",
							JSON.stringify(data.data.engagement, null, 2)
						);
					}

					if (data.data.metadata) {
						console.log("   - Metadata:", JSON.stringify(data.data.metadata, null, 2));
					}

					if (data.data.meta) {
						console.log("   - Meta:", JSON.stringify(data.data.meta, null, 2));
					}
				}

				console.log(
					"📊 Sample Response:",
					`${JSON.stringify(data, null, 2).substring(0, 500)  }...\n`
				);
			} else {
				console.log("❌ Error:", response.status, data.message);
			}
		} catch (error) {
			console.log("❌ Request failed:", error.message);
		}

		console.log("─".repeat(50));
	}
}

// Test session tracking
async function testSessionTracking() {
	console.log("\n🔍 Testing Session Tracking...\n");

	try {
		const sessionId = `test_session_${Date.now()}`;

		// Make multiple requests with same session ID
		for (let i = 0; i < 3; i++) {
			const response = await fetch(`${BASE_URL}/admin/dashboard`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${testConfig.adminToken}`,
					"Content-Type": "application/json",
					"x-session-id": sessionId,
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				},
			});

			console.log(`Request ${i + 1}: ${response.status}`);
			await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
		}

		// Check session analytics
		const sessionResponse = await fetch(`${BASE_URL}/admin/sessions/analytics`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${testConfig.adminToken}`,
				"Content-Type": "application/json",
			},
		});

		if (sessionResponse.ok) {
			const sessionData = await sessionResponse.json();
			console.log("📊 Session Analytics:", JSON.stringify(sessionData.data, null, 2));
		}
	} catch (error) {
		console.log("❌ Session tracking test failed:", error.message);
	}
}

// Expected response format validation
function validateResponseFormat(data) {
	const requiredFields = {
		engagement: ["highly_engaged", "moderately_engaged", "low_engaged"],
		metadata: ["generatedAt", "fromCache", "optimizedVersion", "pipeline"],
		meta: [
			"cacheHit",
			"generatedAt",
			"executionTime",
			"performanceGrade",
			"dataFreshness",
			"optimizations",
		],
	};

	console.log("\n🔍 Validating Response Format...\n");

	for (const [section, fields] of Object.entries(requiredFields)) {
		if (data[section]) {
			console.log(`✅ ${section} section found`);

			for (const field of fields) {
				if (data[section][field] !== undefined) {
					console.log(`   ✅ ${field}: ${JSON.stringify(data[section][field])}`);
				} else {
					console.log(`   ❌ Missing field: ${field}`);
				}
			}
		} else {
			console.log(`❌ Missing section: ${section}`);
		}
	}
}

// Performance test
async function performanceTest() {
	console.log("\n⚡ Performance Test...\n");

	const iterations = 5;
	const times = [];

	for (let i = 0; i < iterations; i++) {
		const start = Date.now();

		try {
			const response = await fetch(`${BASE_URL}/admin/dashboard`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${testConfig.adminToken}`,
					"Content-Type": "application/json",
				},
			});

			const end = Date.now();
			const duration = end - start;
			times.push(duration);

			console.log(`Request ${i + 1}: ${duration}ms`);
		} catch (error) {
			console.log(`Request ${i + 1}: Failed - ${error.message}`);
		}
	}

	if (times.length > 0) {
		const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
		const minTime = Math.min(...times);
		const maxTime = Math.max(...times);

		console.log("\n📊 Performance Summary:");
		console.log(`   Average: ${avgTime.toFixed(2)}ms`);
		console.log(`   Min: ${minTime}ms`);
		console.log(`   Max: ${maxTime}ms`);
		console.log(`   Grade: ${avgTime < 100 ? "A++" : avgTime < 200 ? "A+" : "A"}`);
	}
}

// Main test runner
async function runTests() {
	console.log("🏢 Enterprise Admin Dashboard API Test Suite\n");
	console.log("=".repeat(60));

	// Check if token is configured
	if (testConfig.adminToken === "your_admin_jwt_token_here") {
		console.log("⚠️  Please configure adminToken in testConfig before running tests");
		console.log("   You can get a token by logging in as admin and copying the JWT token\n");
	}

	await testDashboardAPI();
	await testSessionTracking();
	await performanceTest();

	console.log("\n✅ Test suite completed!");
	console.log("\n📋 Expected Response Format:");
	console.log(`
{
  "engagement": {
    "highly_engaged": 0,
    "moderately_engaged": 0,
    "low_engaged": 27
  },
  "metadata": {
    "generatedAt": "2025-08-14T06:19:16.056Z",
    "fromCache": false,
    "optimizedVersion": "v3.0-Production",
    "pipeline": "single_facet_aggregation"
  },
  "meta": {
    "cacheHit": false,
    "generatedAt": "2025-08-14T06:19:16.056Z",
    "executionTime": "100.22ms",
    "performanceGrade": "A",
    "dataFreshness": "real_time",
    "optimizations": [
      "single_facet_pipeline",
      "optimized_date_calculations",
      "smart_caching",
      "timeout_protection"
    ]
  }
}
	`);
}

// Run tests
runTests().catch(console.error);
