require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

// Define schemas directly since we can't import ES modules
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
})

const SubCategorySchema = new mongoose.Schema({
  mainCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Main category is required']
  },
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    maxlength: [100, 'Subcategory name cannot be more than 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
})

const Category = mongoose.model('Category', CategorySchema)
const SubCategory = mongoose.model('SubCategory', SubCategorySchema)

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const categoriesData = [
  {
    name: 'Kathiyawadi Bhojan',
    description: 'Traditional Kathiyawadi main meals and thali items',
    icon: '🍽️',
    status: 'active'
  },
  {
    name: 'Sanj Ni Special Vangi',
    description: 'Evening special vegetable dishes',
    icon: '🌶️',
    status: 'active'
  },
  {
    name: 'Fixed Sanj',
    description: 'Day-wise special dishes',
    icon: '📅',
    status: 'active'
  },
  {
    name: 'Beverages',
    description: 'Traditional drinks and beverages',
    icon: '🥤',
    status: 'active'
  }
]

const subCategoriesData = [
  // Kathiyawadi Bhojan items
  {
    categoryName: 'Kathiyawadi Bhojan',
    items: [
      { name: 'Bhakhri', price: 10, basePrice: 10, description: 'Traditional thick roti made with wheat flour', icon: '🫓' },
      { name: 'Parotha', price: 10, basePrice: 10, description: 'Layered flatbread with ghee', icon: '🥞' },
      { name: 'Sev Tameta', price: 40, basePrice: 40, description: 'Tomato curry with sev topping', icon: '🍅' },
      { name: 'Chhanna Masala', price: 40, basePrice: 40, description: 'Spiced chickpea curry', icon: '🫘' },
      { name: 'Lasaniya Bataka', price: 40, basePrice: 40, description: 'Garlic flavored potato curry', icon: '🥔' },
      { name: 'Dahi Tikhari', price: 40, basePrice: 40, description: 'Yogurt-based vegetable curry', icon: '🥛' },
      { name: 'Mix Sabji', price: 40, basePrice: 40, description: 'Mixed vegetable curry', icon: '🥬' },
      { name: 'Kathiyawadi Kadhi', price: 40, basePrice: 40, description: 'Traditional Gujarati kadhi', icon: '🍛' },
      { name: 'Dal Fry', price: 40, basePrice: 40, description: 'Tempered lentil curry', icon: '🫘' },
      { name: 'Jeera Rice', price: 40, basePrice: 40, description: 'Cumin flavored rice', icon: '🍚' },
      { name: 'Dahi Chhanna', price: 40, basePrice: 40, description: 'Yogurt with chickpeas', icon: '🥛' },
      { name: 'Chhas', price: 10, basePrice: 10, description: 'Traditional buttermilk', icon: '🥛' },
      { name: 'Papad', price: 10, basePrice: 10, description: 'Crispy lentil wafer', icon: '🫓' }
    ]
  },
  // Sanj Ni Special Vangi items
  {
    categoryName: 'Sanj Ni Special Vangi',
    items: [
      { name: 'Bharela Ringan Sambhar', price: 40, basePrice: 40, description: 'Stuffed eggplant with sambhar', icon: '🍆' },
      { name: 'Amli Dongriya Shaak', price: 40, basePrice: 40, description: 'Tamarind hill vegetable curry', icon: '🌿' },
      { name: 'Vadhareli Piyadi', price: 40, basePrice: 40, description: 'Enhanced onion curry', icon: '🧅' }
    ]
  },
  // Fixed Sanj items
  {
    categoryName: 'Fixed Sanj',
    items: [
      { name: 'Bhindi Masala', price: 40, basePrice: 40, description: 'Monday special - Spiced okra curry', icon: '🌶️' },
      { name: 'Methi Masala', price: 40, basePrice: 40, description: 'Tuesday special - Fenugreek curry', icon: '🌿' },
      { name: 'Besan Gatta', price: 40, basePrice: 40, description: 'Wednesday special - Gram flour dumplings', icon: '🥟' },
      { name: 'Dal Palak', price: 40, basePrice: 40, description: 'Thursday special - Lentils with spinach', icon: '🥬' },
      { name: 'Palak Paneer', price: 50, basePrice: 50, description: 'Friday special - Spinach with cottage cheese', icon: '🧀' },
      { name: 'Dhokli Shaak', price: 40, basePrice: 40, description: 'Saturday special - Wheat flour dumplings in curry', icon: '🍲' },
      { name: 'Paneer Tikka', price: 50, basePrice: 50, description: 'Sunday special - Grilled cottage cheese', icon: '🧀' }
    ]
  },
  // Beverages
  {
    categoryName: 'Beverages',
    items: [
      { name: 'Masala Chai', price: 15, basePrice: 15, description: 'Traditional spiced tea', icon: '☕' },
      { name: 'Gujarati Chai', price: 12, basePrice: 12, description: 'Sweet Gujarati style tea', icon: '☕' },
      { name: 'Lassi', price: 25, basePrice: 25, description: 'Traditional yogurt drink', icon: '🥛' },
      { name: 'Fresh Lime Water', price: 20, basePrice: 20, description: 'Fresh lime with water', icon: '🍋' }
    ]
  }
]

async function seedMenu() {
  try {
    await connectDB()

    // Clear existing data
    await Category.deleteMany({})
    await SubCategory.deleteMany({})
    console.log('Cleared existing menu data')

    // Create categories
    const createdCategories = {}
    for (const categoryData of categoriesData) {
      const category = new Category(categoryData)
      await category.save()
      createdCategories[categoryData.name] = category._id
      console.log(`Created category: ${categoryData.name}`)
    }

    // Create subcategories
    let totalSubCategories = 0
    for (const subCategoryGroup of subCategoriesData) {
      const categoryId = createdCategories[subCategoryGroup.categoryName]
      
      for (const item of subCategoryGroup.items) {
        const subCategory = new SubCategory({
          mainCategoryId: categoryId,
          name: item.name,
          price: item.price,
          basePrice: item.basePrice,
          description: item.description,
          icon: item.icon,
          status: 'active'
        })
        await subCategory.save()
        totalSubCategories++
      }
    }

    console.log(`Inserted ${categoriesData.length} categories`)
    console.log(`Inserted ${totalSubCategories} menu items`)
    console.log('New menu structure seeding completed successfully!')

  } catch (error) {
    console.error('Error seeding menu:', error)
  } finally {
    await mongoose.connection.close()
  }
}

seedMenu()
