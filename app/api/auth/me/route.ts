import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No authentication token found'
      }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (!decoded?.userId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    // Get user from database
    const user = await User.findById(decoded.userId)
      .select('+isSuper')
      .lean()
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Account is inactive'
      }, { status: 403 })
    }

    // Update last login
    await User.findByIdAndUpdate(decoded.userId, {
      lastLogin: new Date()
    })

    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error: any) {
    console.error('Auth check error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({
        success: false,
        message: 'Token expired'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: false,
      message: 'Authentication check failed'
    }, { status: 500 })
  }
}