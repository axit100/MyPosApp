import mongoose, { Document, Schema } from 'mongoose'

export interface ISubCategory extends Document {
  mainCategoryId: mongoose.Types.ObjectId
  name: string
  price: number
  basePrice: number
  description: string
  icon?: string // Custom icon (emoji, URL, or SVG content)
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const SubCategorySchema = new Schema<ISubCategory>({
  mainCategoryId: {
    type: Schema.Types.ObjectId,
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

// Index for better search performance
SubCategorySchema.index({ name: 'text', description: 'text' })
SubCategorySchema.index({ mainCategoryId: 1, status: 1 })
SubCategorySchema.index({ status: 1 })

// Compound unique index to prevent duplicate subcategory names within the same main category
SubCategorySchema.index({ mainCategoryId: 1, name: 1 }, { unique: true })

export default mongoose.models?.SubCategory || mongoose.model<ISubCategory>('SubCategory', SubCategorySchema)
