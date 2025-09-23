import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAuth } from '@/lib/auth'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query: any = {}
    
    if (status) {
      query.status = status
    }
    
    const categories = await Category.find(query).sort({ name: 1 })
    
    return NextResponse.json({
      success: true,
      data: categories
    })
    
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request, 'manage_menu')
    await connectDB()
    
    const data = await request.json()
    
    const category = new Category(data)
    await category.save()
    
    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: category
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create category error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
