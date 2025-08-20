// test-delete-admin.js
import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api/v1";

async function testDeleteAdmin() {
	console.log("🧪 Testing Delete Admin Endpoint\n");

	const testData = {
		superAdminToken: "your_super_admin_jwt_token_here", // Replace with actual token
		adminIdToDelete: "689e0d7a188542395cc4c02e", // Replace with actual admin ID
		confirmPassword: "your_super_admin_password", // Replace with actual password
		reason: "Testing admin deletion functionality - this is a test deletion",
	};

	try {
		console.log("📤 Sending DELETE request...");
		console.log(
			"URL:",
			`${BASE_URL}/admin/super-admin/delete-admin/${testData.adminIdToDelete}`,
		);
		console.log("Body:", {
			confirmPassword: "***hidden***",
			reason: testData.reason,
		});

		const response = await fetch(
			`${BASE_URL}/admin/super-admin/delete-admin/${testData.adminIdToDelete}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${testData.superAdminToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					confirmPassword: testData.confirmPassword,
					reason: testData.reason,
				}),
			},
		);

		console.log("\n📥 Response Status:", response.status);

		const responseData = await response.json();
		console.log("📄 Response Data:", JSON.stringify(responseData, null, 2));

		if (response.ok) {
			console.log("\n✅ SUCCESS: Admin deleted successfully");
			console.log("🔍 Verification Details:");
			console.log(
				"   - Password was verified:",
				responseData.data?.meta?.passwordVerified,
			);
			console.log("   - Deleted by:", responseData.data?.meta?.deletedBy);
			console.log("   - Reason logged:", responseData.data?.reason);
		} else {
			console.log("\n❌ ERROR: Request failed");
			console.log("   - Status:", response.status);
			console.log("   - Message:", responseData.message);

			if (response.status === 400) {
				console.log(
					"   - This is likely due to missing confirmPassword or reason",
				);
			} else if (response.status === 401) {
				console.log("   - This is likely due to invalid password confirmation");
			} else if (response.status === 403) {
				console.log("   - This is likely due to insufficient permissions");
			} else if (response.status === 404) {
				console.log("   - This is likely due to admin not found");
			}
		}
	} catch (error) {
		console.log("\n💥 REQUEST FAILED:", error.message);
	}
}

// Test with missing password (should fail)
async function testMissingPassword() {
	console.log("\n🧪 Testing Missing Password (Should Fail)\n");

	try {
		const response = await fetch(
			`${BASE_URL}/admin/super-admin/delete-admin/689e0d7a188542395cc4c02e`,
			{
				method: "DELETE",
				headers: {
					Authorization: "Bearer your_token_here",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					reason: "Test deletion without password",
				}),
			},
		);

		const responseData = await response.json();
		console.log("Status:", response.status);
		console.log("Response:", responseData.message);

		if (response.status === 400) {
			console.log("✅ EXPECTED: Password validation working correctly");
		}
	} catch (error) {
		console.log("Error:", error.message);
	}
}

// Run tests
async function runTests() {
	console.log("🚀 Delete Admin API Test Suite");
	console.log("=".repeat(50));

	if (process.argv.includes("--missing-password")) {
		await testMissingPassword();
	} else {
		await testDeleteAdmin();
	}

	console.log("\n📋 Required Request Format:");
	console.log(`
DELETE {{baseUrl}}/admin/super-admin/delete-admin/{{adminId}}

Headers:
{
  "Authorization": "Bearer YOUR_SUPER_ADMIN_TOKEN",
  "Content-Type": "application/json"
}

Body:
{
  "confirmPassword": "your_super_admin_password",
  "reason": "Detailed reason for deletion (minimum 10 characters)"
}
	`);
}

runTests().catch(console.error);
