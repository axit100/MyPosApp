import { authenticateUser } from '../lib/auth.js'
import connectDB from '../lib/mongodb.js'
import User from '../models/User.js'

async function testLogin() {
  try {
    console.log('Testing database connection and authentication...')
    
    await connectDB()
    console.log('✅ Database connected')
    
    // Check if any users exist
    const userCount = await User.countDocuments()
    console.log(`📊 Total users in database: ${userCount}`)
    
    // Check for specific admin user
    const adminUser = await User.findOne({ email: 'admin@dhabha.com' }).select('+isSuper +password')
    if (adminUser) {
      console.log('✅ Admin user found:', {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        isSuper: adminUser.isSuper,
        hasPassword: !!adminUser.password
      })
      
      // Test password comparison
      try {
        const isValid = await adminUser.comparePassword('admin123')
        console.log(`🔐 Password 'admin123' is ${isValid ? 'VALID' : 'INVALID'}`)
      } catch (error) {
        console.error('❌ Password comparison error:', error)
      }
      
    } else {
      console.log('❌ Admin user not found')
      
      // Show first few users
      const users = await User.find().limit(3).select('name email role isActive')
      console.log('📝 Available users:', users)
    }
    
    // Test authenticateUser function
    console.log('\n🧪 Testing authenticateUser function...')
    const authResult = await authenticateUser('admin@dhabha.com', 'admin123')
    
    if (authResult) {
      console.log('✅ Authentication successful:', {
        name: authResult.name,
        email: authResult.email,
        role: authResult.role,
        isActive: authResult.isActive
      })
    } else {
      console.log('❌ Authentication failed')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
  
  process.exit(0)
}

testLogin()