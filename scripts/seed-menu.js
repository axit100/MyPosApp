const { MongoClient } = require('mongodb');

require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;

const sampleMenuItems = [
  {
    name: "Butter Roti",
    description: "Soft and fluffy Indian bread with butter",
    category: "Roti & Bread",
    basePrice: 25,
    variants: [
      { name: "Plain Roti", price: 20, isAvailable: true },
      { name: "Butter Roti", price: 25, isAvailable: true },
      { name: "Garlic Roti", price: 30, isAvailable: true }
    ],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 10,
    ingredients: ["wheat flour", "butter", "salt"],
    allergens: ["Gluten", "Dairy"],
    icon: "🫓"
  },
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with tender chicken pieces",
    category: "Rice & Biryani",
    basePrice: 180,
    variants: [
      { name: "Half Plate", price: 120, isAvailable: true },
      { name: "Full Plate", price: 180, isAvailable: true },
      { name: "Family Pack", price: 350, isAvailable: true }
    ],
    isAvailable: true,
    isVegetarian: false,
    isSpicy: true,
    preparationTime: 25,
    ingredients: ["basmati rice", "chicken", "spices", "onions", "yogurt"],
    allergens: ["Dairy"],
    icon: "🍚"
  },
  {
    name: "Dal Tadka",
    description: "Yellow lentils tempered with cumin and spices",
    category: "Curries & Dal",
    basePrice: 80,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 15,
    ingredients: ["yellow lentils", "turmeric", "cumin", "onions", "tomatoes"],
    allergens: [],
    icon: "🍛"
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese in rich tomato and butter gravy",
    category: "Curries & Dal",
    basePrice: 150,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 20,
    ingredients: ["paneer", "tomatoes", "butter", "cream", "spices"],
    allergens: ["Dairy"],
    icon: "🧈"
  },
  {
    name: "Samosa",
    description: "Crispy fried pastry with spiced potato filling",
    category: "Snacks & Starters",
    basePrice: 15,
    variants: [
      { name: "Single Piece", price: 15, isAvailable: true },
      { name: "Plate (4 pieces)", price: 50, isAvailable: true }
    ],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 5,
    ingredients: ["potatoes", "peas", "flour", "spices"],
    allergens: ["Gluten"],
    icon: "🥟"
  },
  {
    name: "Masala Chai",
    description: "Traditional Indian spiced tea",
    category: "Beverages",
    basePrice: 20,
    variants: [
      { name: "Regular", price: 20, isAvailable: true },
      { name: "Special", price: 25, isAvailable: true }
    ],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["tea leaves", "milk", "sugar", "cardamom", "ginger"],
    allergens: ["Dairy"],
    icon: "☕"
  },
  {
    name: "Gulab Jamun",
    description: "Sweet milk dumplings in sugar syrup",
    category: "Desserts",
    basePrice: 60,
    variants: [
      { name: "2 pieces", price: 60, isAvailable: true },
      { name: "4 pieces", price: 100, isAvailable: true }
    ],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["milk powder", "flour", "sugar", "cardamom"],
    allergens: ["Dairy", "Gluten"],
    icon: "🍯"
  },
  {
    name: "Tandoori Chicken",
    description: "Marinated chicken cooked in tandoor",
    category: "Tandoor",
    basePrice: 200,
    variants: [
      { name: "Half", price: 200, isAvailable: true },
      { name: "Full", price: 350, isAvailable: true }
    ],
    isAvailable: true,
    isVegetarian: false,
    isSpicy: true,
    preparationTime: 30,
    ingredients: ["chicken", "yogurt", "spices", "lemon"],
    allergens: ["Dairy"],
    icon: "🍖"
  }
];

async function seedMenu() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('dhabha-pos');
    const collection = db.collection('menuitems');
    
    // Clear existing menu items
    await collection.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Insert sample menu items
    const result = await collection.insertMany(sampleMenuItems);
    console.log(`Inserted ${result.insertedCount} menu items`);
    
    console.log('Menu seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding menu:', error);
  } finally {
    await client.close();
  }
}

seedMenu();
