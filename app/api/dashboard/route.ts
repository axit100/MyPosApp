import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, 'view_dashboard')
    await connectDB()
    
    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Fetch all metrics in parallel for better performance
    const [
      activeTables,
      todayOrders,
    ] = await Promise.all([
      // Active Tables (occupied or reserved)
     
      // Today's Orders
      Order.countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      }),
      
      // Today's Earnings (sum of finalAmount for paid orders)
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay
            },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$finalAmount' }
          }
        }
      ]),
      
      // Total Menu Items (available items only)
    ])
    
    // Extract earnings from aggregation result
    const earnings = 0;
    
    // Get additional details for better dashboard insights
    const [totalTables] = await Promise.all([
      Order.countDocuments({
        status: { $in: ['pending', 'preparing'] },
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      })
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        activeTables: {
          count: activeTables,
          total: totalTables,
          percentage: totalTables > 0 ? Math.round((activeTables / totalTables) * 100) : 0
        },
        todayOrders: {
          count: todayOrders,
        },
        todayEarnings: {
          amount: earnings,
          formatted: `₹${earnings.toLocaleString('en-IN')}`
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
