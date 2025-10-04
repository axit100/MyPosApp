import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function createSuperAdmin() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI!
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne().select('+isSuper').where({ isSuper: true })
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.name, '(' + existingSuperAdmin.email + ')')
      return
    }

    // Create super admin user
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@dhabha.com',
      password: 'superadmin123',
      role: 'admin',
      phone: '+919999999999',
      isActive: true
    })

    // Save the user first
    await superAdmin.save()
    
    // Then update isSuper field directly (bypassing the pre-save middleware)
    await User.findByIdAndUpdate(superAdmin._id, { isSuper: true })
    
    console.log('✅ Super admin user created successfully!')
    console.log('📧 Email: superadmin@dhabha.com')
    console.log('🔒 Password: superadmin123')
    console.log('⚠️  Note: This user cannot be deleted through the API')

  } catch (error) {
    console.error('❌ Error creating super admin:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

createSuperAdmin()