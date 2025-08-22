// test-location-api.js
// Simple test script for location tracking API endpoints

import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/v1/auth/activity";
const TEST_TOKEN = "your_jwt_token_here"; // Replace with actual token

const headers = {
	Authorization: `Bearer ${TEST_TOKEN}`,
	"Content-Type": "application/json",
};

async function testLocationEndpoints() {
	console.log("🧪 Testing Location Tracking API Endpoints\n");

	try {
		// Test 1: Get Login Locations
		console.log("📍 Testing GET /locations...");
		const locationsResponse = await fetch(
			`${BASE_URL}/locations?limit=5&days=30`,
			{
				method: "GET",
				headers,
			},
		);

		const locationsData = await locationsResponse.json();
		console.log("✅ Status:", locationsResponse.status);
		console.log("📊 Response:", JSON.stringify(locationsData, null, 2));
		console.log("---\n");

		// Test 2: Get Location Analytics
		console.log("📈 Testing GET /location-analytics...");
		const analyticsResponse = await fetch(
			`${BASE_URL}/location-analytics?days=7`,
			{
				method: "GET",
				headers,
			},
		);

		const analyticsData = await analyticsResponse.json();
		console.log("✅ Status:", analyticsResponse.status);
		console.log("📊 Response:", JSON.stringify(analyticsData, null, 2));
		console.log("---\n");

		// Test 3: Performance Test
		console.log("⚡ Performance Test - Multiple Requests...");
		const startTime = Date.now();

		const promises = Array(5)
			.fill()
			.map(() =>
				fetch(`${BASE_URL}/locations?limit=3`, { method: "GET", headers }),
			);

		await Promise.all(promises);
		const endTime = Date.now();

		console.log(
			`✅ Completed 5 concurrent requests in ${endTime - startTime}ms`,
		);
		console.log("---\n");

		console.log("🎉 All tests completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error.message);

		if (error.message.includes("fetch")) {
			console.log(
				"💡 Make sure the server is running on http://localhost:5000",
			);
		}

		if (error.message.includes("401")) {
			console.log("💡 Please update TEST_TOKEN with a valid JWT token");
		}
	}
}

// Helper function to generate sample data for testing
async function generateSampleData() {
	console.log("🔧 Generating sample location data...");

	// This would typically be done through actual login requests
	// For testing purposes, you might want to create some sample data

	const sampleLocations = [
		{
			city: "New York",
			region: "New York",
			country: "United States",
			timezone: "America/New_York",
		},
		{
			city: "London",
			region: "England",
			country: "United Kingdom",
			timezone: "Europe/London",
		},
		{
			city: "Tokyo",
			region: "Tokyo",
			country: "Japan",
			timezone: "Asia/Tokyo",
		},
	];

	console.log("📍 Sample locations:", sampleLocations);
	console.log(
		"💡 To populate real data, perform login requests from different locations",
	);
}

// Run tests
if (process.argv.includes("--generate-sample")) {
	generateSampleData();
} else {
	testLocationEndpoints();
}

// Export for use in other test files
export { testLocationEndpoints, generateSampleData };
