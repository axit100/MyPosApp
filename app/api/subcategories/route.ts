import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SubCategory from '@/models/SubCategory'
import Category from '@/models/Category'
import { requireAuth } from '@/lib/auth'

// GET /api/subcategories - Get all subcategories
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Ensure Category model is registered
    const CategoryModel = Category

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')

    let query: any = {}

    if (categoryId) {
      query.mainCategoryId = categoryId
    }

    if (status) {
      query.status = status
    }

    const subcategories = await SubCategory.find(query)
      .populate('mainCategoryId', 'name')
      .sort({ name: 1 })
    
    return NextResponse.json({
      success: true,
      data: subcategories
    })
    
  } catch (error) {
    console.error('Get subcategories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    )
  }
}

// POST /api/subcategories - Create new subcategory
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request, 'manage_menu')
    await connectDB()
    
    const data = await request.json()
    
    const subcategory = new SubCategory(data)
    await subcategory.save()
    
    // Populate the category data for response
    await subcategory.populate('mainCategoryId', 'name')
    
    return NextResponse.json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Create subcategory error:', error)
    
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
        { error: 'Subcategory name already exists in this category' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    )
  }
}
