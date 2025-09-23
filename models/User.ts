import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'staff' | 'manager'
  isActive: boolean
  permissions: string[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'manager'],
    default: 'staff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: [
      'view_dashboard',
      'manage_orders',
      'manage_menu',
      'manage_tables',
      'view_reports',
      'manage_users',
      'manage_settings'
    ]
  }]
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Set default permissions based on role
UserSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = [
          'view_dashboard',
          'manage_orders',
          'manage_menu',
          'manage_tables',
          'view_reports',
          'manage_users',
          'manage_settings'
        ]
        break
      case 'manager':
        this.permissions = [
          'view_dashboard',
          'manage_orders',
          'manage_menu',
          'manage_tables',
          'view_reports'
        ]
        break
      case 'staff':
        this.permissions = [
          'view_dashboard',
          'manage_orders',
          'manage_tables'
        ]
        break
    }
  }
  next()
})

export default mongoose.models?.User || mongoose.model<IUser>('User', UserSchema)
