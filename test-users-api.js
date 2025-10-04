// Test script for Users API
// Run this in browser console to test the API endpoints

const testUsersAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Users API...');
  
  try {
    // 1. Test GET /api/users
    console.log('📋 Testing GET /api/users...');
    const getUsersResponse = await fetch(`${baseURL}/api/users`);
    const usersData = await getUsersResponse.json();
    console.log('✅ GET Users:', usersData);
    
    // 2. Test POST /api/users (Create user)
    console.log('➕ Testing POST /api/users...');
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'staff',
      phone: '+1234567890',
      isActive: true
    };
    
    const createResponse = await fetch(`${baseURL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });
    const createData = await createResponse.json();
    console.log('✅ POST User:', createData);
    
    if (createData.success && createData.data._id) {
      const userId = createData.data._id;
      
      // 3. Test PUT /api/users/[id] (Update user)
      console.log('✏️ Testing PUT /api/users/[id]...');
      const updateData = {
        name: 'Updated Test User',
        email: 'updated@example.com',
        phone: '+9876543210'
      };
      
      const updateResponse = await fetch(`${baseURL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      const updatedData = await updateResponse.json();
      console.log('✅ PUT User:', updatedData);
      
      // 4. Test GET /api/users/[id] (Get single user)
      console.log('🔍 Testing GET /api/users/[id]...');
      const getSingleResponse = await fetch(`${baseURL}/api/users/${userId}`);
      const singleUserData = await getSingleResponse.json();
      console.log('✅ GET Single User:', singleUserData);
      
      // 5. Test DELETE /api/users/[id] (Delete user)
      console.log('🗑️ Testing DELETE /api/users/[id]...');
      const deleteResponse = await fetch(`${baseURL}/api/users/${userId}`, {
        method: 'DELETE'
      });
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE User:', deleteData);
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testUsersAPI();