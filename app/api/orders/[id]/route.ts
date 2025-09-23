import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'

// PUT /api/orders/[id] - Update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request, 'manage_orders')
    await connectDB()
    
    const { id } = await params;
    const body = await request.json();
    
    // Try to find by MongoDB _id first, if that fails, try by orderNumber
    let order;
    try {
      order = await Order.findById(id);
    } catch (error) {
      // If _id cast fails, try finding by orderNumber
      order = await Order.findOne({ orderNumber: id });
    }
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order with provided data
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        customerName: body.customerName ?? order.customerName,
        customerPhone: body.customerPhone ?? order.customerPhone,
        tableNumber: body.tableNumber ?? order.tableNumber,
        totalAmount: body.totalAmount ?? order.totalAmount,
        discount: body.discount ?? order.discount,
        finalAmount: body.finalAmount ?? order.finalAmount,
        paymentStatus: body.paymentStatus ?? order.paymentStatus,
        status: body.status ?? order.status,
        notes: body.notes ?? order.notes,
        items: body.items ?? order.items,
      },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })
    
  } catch (error: any) {
    console.error('Update order error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth(request)
    await connectDB()
    
    const { id } = await params
    
    // Try to find by MongoDB _id first, if that fails, try by orderNumber
    let order;
    try {
      order = await Order.findById(id);
    } catch {
      // If _id cast fails, try finding by orderNumber
      order = await Order.findOne({ orderNumber: id });
    }
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    await Order.findByIdAndDelete(order._id)
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })
    
  } catch (error: unknown) {
    console.error('Delete order error:', error)
    
    if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Insufficient permissions')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}