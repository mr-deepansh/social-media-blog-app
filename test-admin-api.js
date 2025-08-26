// Quick test script to verify admin API
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAdminAPI() {
    try {
        console.log('🧪 Testing Admin API endpoints...\n');
        
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${BASE_URL}`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
        
        // Test 2: Get all users (without auth - should fail)
        console.log('\n2. Testing users endpoint (no auth)...');
        const usersResponse = await fetch(`${BASE_URL}/admin/users`);
        console.log('Status:', usersResponse.status);
        
        if (usersResponse.status === 401) {
            console.log('✅ Correctly requires authentication');
        } else {
            const usersData = await usersResponse.json();
            console.log('Response:', usersData);
        }
        
        // Test 3: Check if users exist in database
        console.log('\n3. Testing direct users endpoint...');
        const directUsersResponse = await fetch(`${BASE_URL}/users`);
        console.log('Direct users status:', directUsersResponse.status);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAdminAPI();