import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SubCategory from '@/models/SubCategory'
import { requireAuth } from '@/lib/auth'

// GET /api/subcategories/[id] - Get single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const subcategory = await SubCategory.findById(id)
      .populate('mainCategoryId', 'name')
    
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: subcategory
    })
    
  } catch (error) {
    console.error('Get subcategory error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategory' },
      { status: 500 }
    )
  }
}

// PUT /api/subcategories/[id] - Update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, 'manage_menu')
    await connectDB()
    
    const { id } = await params
    const data = await request.json()
    
    const subcategory = await SubCategory.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    ).populate('mainCategoryId', 'name')
    
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory
    })
    
  } catch (error: any) {
    console.error('Update subcategory error:', error)
    
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
      { error: 'Failed to update subcategory' },
      { status: 500 }
    )
  }
}

// DELETE /api/subcategories/[id] - Delete subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, 'manage_menu')
    await connectDB()
    
    const { id } = await params
    const subcategory = await SubCategory.findByIdAndDelete(id)
    
    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Delete subcategory error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    )
  }
}
