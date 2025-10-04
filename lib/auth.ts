import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import User, { IUser } from '@/models/User'
import connectDB from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET!

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: (user._id as string).toString(),
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<IUser | null> {
  try {
    console.log('📡 Connecting to database...')
    await connectDB()
    console.log('✅ Database connected')
    
    console.log('🔍 Looking for user with email:', email, 'and isActive: true')
    const user = await User.findOne({ email, isActive: true }).select('+password')
    
    if (!user) {
      console.log('❌ User not found or inactive for email:', email)
      
      // Check if user exists but is inactive
      const inactiveUser = await User.findOne({ email }).select('isActive')
      if (inactiveUser) {
        console.log('⚠️  User exists but is inactive:', inactiveUser.isActive)
      } else {
        console.log('❌ User does not exist at all')
      }
      return null
    }
    
    console.log('✅ User found:', user.name, 'Role:', user.role, 'Active:', user.isActive)
    console.log('🔐 Comparing password...')
    
    const isPasswordValid = await user.comparePassword(password)
    console.log('🔐 Password comparison result:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Password invalid for user:', email)
      return null
    }
    
    console.log('✅ Authentication successful for:', user.name)
    return user
  } catch (error) {
    console.error('💥 Authentication error:', error)
    return null
  }
}

export async function getCurrentUser(request: NextRequest): Promise<IUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
    await connectDB()
    const user = await User.findById(payload.userId)
    
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export function hasPermission(user: IUser, permission: string): boolean {
  return user.permissions.includes(permission)
}

export async function requireAuth(request: NextRequest, requiredPermission?: string) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}
