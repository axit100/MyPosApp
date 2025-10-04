import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const user = await User.findById(params.id, '-password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const updates = await request.json()
    
    // Remove fields that shouldn't be updated via API
    delete updates.isSuper
    delete updates.password // Password updates should be handled separately
    delete updates._id
    
    // Find user to check if they exist and get current data
    const existingUser = await User.findById(params.id).select('+isSuper')
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if trying to update email and if it conflicts
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: params.id } 
      })
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')
    
    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    })
  } catch (error: any) {
    console.error('User update error:', error)
    
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
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (with super admin protection)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Find user and include isSuper field for checking
    const user = await User.findById(params.id).select('+isSuper')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Protect super admin from deletion
    if (user.isSuper) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete super admin user',
          message: 'Super admin users are protected from deletion for security reasons'
        },
        { status: 403 }
      )
    }
    
    // Delete the user
    await User.findByIdAndDelete(params.id)
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}