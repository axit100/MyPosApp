import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import SubCategory from '@/models/SubCategory'
import { requireAuth } from '@/lib/auth'

// GET /api/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const category = await Category.findById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: category
    })
    
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, 'manage_menu')
    await connectDB()
    
    const { id } = await params
    const data = await request.json()
    
    const category = await Category.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    )
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    })
    
  } catch (error: any) {
    console.error('Update category error:', error)
    
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
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, 'manage_menu')
    await connectDB()
    
    const { id } = await params
    
    // Check if category has subcategories
    const subcategoriesCount = await SubCategory.countDocuments({ mainCategoryId: id })
    
    if (subcategoriesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing subcategories. Please delete subcategories first.' },
        { status: 400 }
      )
    }
    
    const category = await Category.findByIdAndDelete(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Delete category error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
