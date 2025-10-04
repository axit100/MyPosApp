import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Fetch all users
export async function GET() {
  try {
    await connectDB()
    
    const users = await User.find({}, '-password').sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error: any) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const userData = await request.json()
    
    // Ensure isSuper is always false for new users
    userData.isSuper = false
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Create new user
    const user = new User(userData)
    await user.save()
    
    // Return user without password
    const userResponse = await User.findById(user._id, '-password')
    
    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('User creation error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message
      }))
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors,
          message: validationErrors.map((err: any) => err.message).join(', ')
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}