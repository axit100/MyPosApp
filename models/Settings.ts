import mongoose, { Document, Schema } from 'mongoose'

export interface IRestaurantSettings extends Document {
  restaurantName: string
  address: string
  phone: string
  email: string
  gstNumber?: string
  currency: string
  timezone: string
  taxRate: number
  serviceCharge: number
  operatingHours: {
    open: string
    close: string
    isOpen24Hours: boolean
  }
  printerSettings: {
    kitchenPrinter: boolean
    billPrinter: boolean
    printerIP?: string
  }
  orderSettings: {
    autoAcceptOrders: boolean
    defaultPreparationTime: number
    maxOrdersPerTable: number
    orderStatuses: string[]
  }
  paymentMethods: {
    cash: boolean
    card: boolean
    upi: boolean
    online: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const RestaurantSettingsSchema = new Schema<IRestaurantSettings>({
  restaurantName: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  taxRate: {
    type: Number,
    default: 18,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  serviceCharge: {
    type: Number,
    default: 0,
    min: [0, 'Service charge cannot be negative'],
    max: [100, 'Service charge cannot exceed 100%']
  },
  operatingHours: {
    open: {
      type: String,
      default: '09:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    close: {
      type: String,
      default: '23:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    isOpen24Hours: {
      type: Boolean,
      default: false
    }
  },
  printerSettings: {
    kitchenPrinter: {
      type: Boolean,
      default: true
    },
    billPrinter: {
      type: Boolean,
      default: true
    },
    printerIP: {
      type: String,
      trim: true
    }
  },
  orderSettings: {
    autoAcceptOrders: {
      type: Boolean,
      default: true
    },
    defaultPreparationTime: {
      type: Number,
      default: 15,
      min: [1, 'Preparation time must be at least 1 minute']
    },
    maxOrdersPerTable: {
      type: Number,
      default: 5,
      min: [1, 'Max orders per table must be at least 1']
    },
    orderStatuses: {
      type: [String],
      default: ['Serving', 'Paid']
    }
  },
  paymentMethods: {
    cash: {
      type: Boolean,
      default: true
    },
    card: {
      type: Boolean,
      default: true
    },
    upi: {
      type: Boolean,
      default: true
    },
    online: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

// Ensure only one settings document exists
RestaurantSettingsSchema.index({}, { unique: true })

export default mongoose.models?.RestaurantSettings || mongoose.model<IRestaurantSettings>('RestaurantSettings', RestaurantSettingsSchema)
