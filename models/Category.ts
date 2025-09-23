import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
  name: string
  description: string
  icon?: string // Custom icon (emoji or URL)
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>({
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

// Index for better search performance
CategorySchema.index({ name: 'text', description: 'text' })
CategorySchema.index({ status: 1 })

export default mongoose.models?.Category || mongoose.model<ICategory>('Category', CategorySchema)
