import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'staff' | 'manager'
  isSuper: boolean
  isActive: boolean
  phone?: string
  permissions: string[]
  lastLogin?: Date
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
  isSuper: {
    type: Boolean,
    default: false,
    select: false // Don't include in regular queries for security
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{0,15}$/, 'Please enter a valid phone number']
  },
  lastLogin: {
    type: Date
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

// Prevent setting isSuper to true (only can be set in database directly)
UserSchema.pre('save', function(next) {
  if (this.isModified('isSuper') && this.isSuper === true && this.isNew) {
    // Only allow isSuper to be set to true if explicitly done (not through API)
    this.isSuper = false
  }
  next()
})

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
