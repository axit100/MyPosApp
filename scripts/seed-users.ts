import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function seedUsers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI!
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing users
    await User.deleteMany({})
    console.log('Cleared existing users')

    // Create test users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@dhabha.com',
        password: 'admin123',
        role: 'admin',
        phone: '+919876543210',
        isActive: true
      },
      {
        name: 'Manager Singh',
        email: 'manager@dhabha.com',
        password: 'manager123',
        role: 'manager',
        phone: '+919876543211',
        isActive: true
      },
      {
        name: 'Staff Kumar',
        email: 'staff@dhabha.com',
        password: 'staff123',
        role: 'staff',
        phone: '+919876543212',
        isActive: true
      },
      {
        name: 'Test Staff',
        email: 'test@dhabha.com',
        password: 'test123',
        role: 'staff',
        phone: '+919876543213',
        isActive: false
      }
    ]

    const createdUsers = await User.insertMany(users)
    console.log(`✅ Created ${createdUsers.length} users`)

    // Create super admin separately
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@dhabha.com',
      password: 'superadmin123',
      role: 'admin',
      phone: '+919999999999',
      isActive: true
    })

    await superAdmin.save()
    // Set isSuper to true directly
    await User.findByIdAndUpdate(superAdmin._id, { isSuper: true })
    console.log('✅ Super admin created')

    console.log('🎉 User seeding completed successfully!')
    console.log('👤 Test users:')
    console.log('   Admin: admin@dhabha.com / admin123')
    console.log('   Manager: manager@dhabha.com / manager123')
    console.log('   Staff: staff@dhabha.com / staff123')
    console.log('   Super Admin: superadmin@dhabha.com / superadmin123')

  } catch (error) {
    console.error('❌ Error seeding users:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedUsers()