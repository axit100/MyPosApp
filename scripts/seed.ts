import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Load environment variables FIRST
dotenv.config({ path: '.env.local' })

// Now import other modules
import User from '../models/User'
import Category from '../models/Category'
import SubCategory from '../models/SubCategory'
import RestaurantSettings from '../models/Settings'

async function seedDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI!
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await SubCategory.deleteMany({})
    await RestaurantSettings.deleteMany({})
    console.log('Cleared existing data')

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@dhabha.com',
      password: 'admin123',
      role: 'admin'
    })
    await adminUser.save()
    console.log('Created admin user')

    // Create staff user
    const staffUser = new User({
      name: 'Staff Member',
      email: 'staff@dhabha.com',
      password: 'staff123',
      role: 'staff'
    })
    await staffUser.save()
    console.log('Created staff user')

    // Create categories
    const categories = [
      {
        name: 'Roti & Bread',
        description: 'Freshly baked breads and rotis',
        image: '/images/categories/bread.jpg',
        isActive: true
      },
      {
        name: 'Rice & Biryani',
        description: 'Aromatic rice dishes and biryanis',
        image: '/images/categories/rice.jpg',
        isActive: true
      },
      {
        name: 'Curries & Dal',
        description: 'Traditional curries and lentil dishes',
        image: '/images/categories/curry.jpg',
        isActive: true
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        image: '/images/categories/beverages.jpg',
        isActive: true
      }
    ]
    
    const createdCategories = await Category.insertMany(categories)
    console.log('Created categories')

    // Create subcategories (menu items)
    const subcategories = [
      // Roti & Bread items
      {
        name: 'Butter Roti',
        description: 'Soft wheat bread with butter',
        category: createdCategories[0]._id,
        price: 15,
        image: '/images/items/butter-roti.jpg',
        isActive: true
      },
      {
        name: 'Garlic Naan',
        description: 'Leavened bread with garlic and herbs',
        category: createdCategories[0]._id,
        price: 45,
        image: '/images/items/garlic-naan.jpg',
        isActive: true
      },
      {
        name: 'Tandoori Roti',
        description: 'Whole wheat bread cooked in tandoor',
        category: createdCategories[0]._id,
        price: 20,
        image: '/images/items/tandoori-roti.jpg',
        isActive: true
      },

      // Rice & Biryani items
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with spiced chicken',
        category: createdCategories[1]._id,
        price: 180,
        image: '/images/items/chicken-biryani.jpg',
        isActive: true
      },
      {
        name: 'Veg Biryani',
        description: 'Aromatic basmati rice with mixed vegetables',
        category: createdCategories[1]._id,
        price: 150,
        image: '/images/items/veg-biryani.jpg',
        isActive: true
      },
      {
        name: 'Jeera Rice',
        description: 'Basmati rice with cumin seeds',
        category: createdCategories[1]._id,
        price: 80,
        image: '/images/items/jeera-rice.jpg',
        isActive: true
      },

      // Curries & Dal items
      {
        name: 'Butter Chicken',
        description: 'Creamy tomato-based chicken curry',
        category: createdCategories[2]._id,
        price: 220,
        image: '/images/items/butter-chicken.jpg',
        isActive: true
      },
      {
        name: 'Dal Tadka',
        description: 'Yellow lentils with tempering',
        category: createdCategories[2]._id,
        price: 120,
        image: '/images/items/dal-tadka.jpg',
        isActive: true
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese in rich tomato gravy',
        category: createdCategories[2]._id,
        price: 180,
        image: '/images/items/paneer-butter-masala.jpg',
        isActive: true
      },

      // Beverages
      {
        name: 'Masala Chai',
        description: 'Spiced Indian tea',
        category: createdCategories[3]._id,
        price: 25,
        image: '/images/items/masala-chai.jpg',
        isActive: true
      },
      {
        name: 'Fresh Lime Water',
        description: 'Refreshing lime juice with water',
        category: createdCategories[3]._id,
        price: 35,
        image: '/images/items/lime-water.jpg',
        isActive: true
      },
      {
        name: 'Lassi',
        description: 'Traditional yogurt drink',
        category: createdCategories[3]._id,
        price: 50,
        image: '/images/items/lassi.jpg',
        isActive: true
      }
    ]

    await SubCategory.insertMany(subcategories)
    console.log('Created menu items')

    // Create restaurant settings
    const settings = new RestaurantSettings({
      restaurantName: 'Dhabha Express',
      address: '123 Food Street, Spice City, India 400001',
      phone: '9876543210',
      email: 'info@dhabhaexpress.com',
      gstNumber: '27AAAAA0000A1Z5',
      currency: 'INR',
      taxRate: 18,
      serviceCharge: 10
    })
    await settings.save()
    console.log('Created restaurant settings')

    console.log('Database seeded successfully!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@dhabha.com / admin123')
    console.log('Staff: staff@dhabha.com / staff123')

  } catch (error) {
    console.error('Seeding error:', error)
  } finally {
    await mongoose.connection.close()
  }
}

// Run the seed function
seedDatabase()
