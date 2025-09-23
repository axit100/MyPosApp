require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const kathiyawadiMenuItems = [
  // 1. Kathiyawadi Bhojan (Main Meals) - Rotla / Roti
  {
    name: "Bhakhri",
    description: "Traditional Kathiyawadi thick bread",
    category: "Kathiyawadi Bhojan",
    subCategory: "Rotla / Roti",
    basePrice: 10,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 10,
    ingredients: ["wheat flour", "oil", "salt"],
    allergens: ["Gluten"],
    icon: "🫓"
  },
  {
    name: "Parotha",
    description: "Layered Kathiyawadi flatbread",
    category: "Kathiyawadi Bhojan",
    subCategory: "Rotla / Roti",
    basePrice: 10,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 12,
    ingredients: ["wheat flour", "ghee", "salt"],
    allergens: ["Gluten", "Dairy"],
    icon: "🥞"
  },

  // Kathiyawadi Bhojan - Sabji (Vegetables & Curries)
  {
    name: "Sev Tameta",
    description: "Tomato curry with sev topping",
    category: "Kathiyawadi Bhojan",
    subCategory: "Sabji",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 20,
    ingredients: ["tomatoes", "sev", "onions", "spices"],
    allergens: ["Gluten"],
    icon: "🍅"
  },
  {
    name: "Chhanna Masala",
    description: "Spiced chickpea curry",
    category: "Kathiyawadi Bhojan",
    subCategory: "Sabji",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 25,
    ingredients: ["chickpeas", "onions", "tomatoes", "spices"],
    allergens: [],
    icon: "🫘"
  },
  {
    name: "Lasaniya Bataka",
    description: "Garlic flavored potato curry",
    category: "Kathiyawadi Bhojan",
    subCategory: "Sabji",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 18,
    ingredients: ["potatoes", "garlic", "spices", "oil"],
    allergens: [],
    icon: "🥔"
  },
  {
    name: "Dahi Tikhari",
    description: "Yogurt-based tangy curry",
    category: "Kathiyawadi Bhojan",
    subCategory: "Sabji",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 15,
    ingredients: ["yogurt", "gram flour", "spices", "vegetables"],
    allergens: ["Dairy"],
    icon: "🥛"
  },
  {
    name: "Mix Sabji",
    description: "Mixed vegetable curry",
    category: "Kathiyawadi Bhojan",
    subCategory: "Sabji",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 22,
    ingredients: ["mixed vegetables", "spices", "onions", "tomatoes"],
    allergens: [],
    icon: "🥬"
  },

  // Kathiyawadi Bhojan - Dal & Kadhi
  {
    name: "Kathiyawadi Kadhi",
    description: "Traditional Kathiyawadi yogurt curry",
    category: "Kathiyawadi Bhojan",
    subCategory: "Dal & Kadhi",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 25,
    ingredients: ["yogurt", "gram flour", "ginger", "green chilies"],
    allergens: ["Dairy"],
    icon: "🍛"
  },
  {
    name: "Dal Fry",
    description: "Tempered lentil curry",
    category: "Kathiyawadi Bhojan",
    subCategory: "Dal & Kadhi",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 20,
    ingredients: ["lentils", "turmeric", "cumin", "onions"],
    allergens: [],
    icon: "🫘"
  },

  // Kathiyawadi Bhojan - Rice & Sides
  {
    name: "Jeera Rice",
    description: "Cumin flavored basmati rice",
    category: "Kathiyawadi Bhojan",
    subCategory: "Rice & Sides",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 15,
    ingredients: ["basmati rice", "cumin", "ghee", "salt"],
    allergens: ["Dairy"],
    icon: "🍚"
  },
  {
    name: "Dahi Chhanna",
    description: "Yogurt with chickpeas",
    category: "Kathiyawadi Bhojan",
    subCategory: "Rice & Sides",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 10,
    ingredients: ["yogurt", "chickpeas", "spices"],
    allergens: ["Dairy"],
    icon: "🥛"
  },
  {
    name: "Chhas",
    description: "Traditional buttermilk",
    category: "Kathiyawadi Bhojan",
    subCategory: "Rice & Sides",
    basePrice: 10,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["yogurt", "water", "salt", "cumin"],
    allergens: ["Dairy"],
    icon: "🥤"
  },
  {
    name: "Papad",
    description: "Crispy lentil wafer",
    category: "Kathiyawadi Bhojan",
    subCategory: "Rice & Sides",
    basePrice: 10,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 3,
    ingredients: ["lentil flour", "salt", "spices"],
    allergens: [],
    icon: "🥨"
  },

  // 2. Sanj Ni Special Vangi (Evening Specials)
  {
    name: "Bharela Ringan Sambhar",
    description: "Stuffed eggplant in sambhar",
    category: "Sanj Ni Special Vangi",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 30,
    ingredients: ["eggplant", "lentils", "tamarind", "spices"],
    allergens: [],
    icon: "🍆"
  },
  {
    name: "Amli Dongriya Shaak",
    description: "Tamarind hill vegetable curry",
    category: "Sanj Ni Special Vangi",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 25,
    ingredients: ["hill vegetables", "tamarind", "jaggery", "spices"],
    allergens: [],
    icon: "🌿"
  },
  {
    name: "Vadhareli Piyadi",
    description: "Enhanced onion curry",
    category: "Sanj Ni Special Vangi",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 20,
    ingredients: ["onions", "spices", "oil", "herbs"],
    allergens: [],
    icon: "🧅"
  },

  // 3. Fixed Sanj (Day-Wise Specials)
  {
    name: "Bhindi Masala",
    description: "Spiced okra curry - Monday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 20,
    ingredients: ["okra", "onions", "tomatoes", "spices"],
    allergens: [],
    icon: "🌶️",
    daySpecific: "Monday"
  },
  {
    name: "Methi Masala",
    description: "Fenugreek leaves curry - Tuesday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 18,
    ingredients: ["fenugreek leaves", "potatoes", "spices"],
    allergens: [],
    icon: "🌿",
    daySpecific: "Tuesday"
  },
  {
    name: "Besan Gatta",
    description: "Gram flour dumplings curry - Wednesday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 25,
    ingredients: ["gram flour", "yogurt", "spices"],
    allergens: ["Dairy"],
    icon: "🥟",
    daySpecific: "Wednesday"
  },
  {
    name: "Dal Palak",
    description: "Lentils with spinach - Thursday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 22,
    ingredients: ["lentils", "spinach", "spices"],
    allergens: [],
    icon: "🥬",
    daySpecific: "Thursday"
  },
  {
    name: "Palak Paneer",
    description: "Spinach with cottage cheese - Friday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 50,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 20,
    ingredients: ["spinach", "paneer", "cream", "spices"],
    allergens: ["Dairy"],
    icon: "🧀",
    daySpecific: "Friday"
  },
  {
    name: "Dhokli Shaak",
    description: "Wheat dumplings in vegetable curry - Saturday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 40,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 30,
    ingredients: ["wheat flour", "vegetables", "spices"],
    allergens: ["Gluten"],
    icon: "🍲",
    daySpecific: "Saturday"
  },
  {
    name: "Paneer Tikka",
    description: "Grilled cottage cheese - Sunday Special",
    category: "Fixed Sanj",
    subCategory: "",
    basePrice: 50,
    variants: [],
    isAvailable: true,
    isVegetarian: true,
    isSpicy: true,
    preparationTime: 25,
    ingredients: ["paneer", "yogurt", "spices", "bell peppers"],
    allergens: ["Dairy"],
    icon: "🧀",
    daySpecific: "Sunday"
  }
];

async function seedKathiyawadiMenu() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('dhabha-pos');
    const collection = db.collection('menuitems');
    
    // Clear existing menu items
    await collection.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Insert Kathiyawadi menu items
    const result = await collection.insertMany(kathiyawadiMenuItems);
    console.log(`Inserted ${result.insertedCount} Kathiyawadi menu items`);
    
    console.log('Kathiyawadi menu seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding Kathiyawadi menu:', error);
  } finally {
    await client.close();
  }
}

seedKathiyawadiMenu();
