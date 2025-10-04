import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import CashNote from '@/models/CashNote'
import SubCategory from '@/models/SubCategory'
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
      todayOrders,
      todayEarnings,
      todayDebits,
      pendingOrders,
      totalMenuItems
    ] = await Promise.all([
      // Today's Orders count
      Order.countDocuments({
        orderTime: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      }),
      
      // Today's Earnings (sum of finalAmount for all orders)
      Order.aggregate([
        {
          $match: {
            orderTime: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$finalAmount' }
          }
        }
      ]),
      
      // Today's Debits (sum of debit amounts)
      CashNote.aggregate([
        {
          $match: {
            type: 'debit',
            date: {
              $gte: startOfDay,
              $lt: endOfDay
            }
          }
        },
        {
          $group: {
            _id: null,
            totalDebits: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Today's Pending Orders
      Order.countDocuments({
        orderTime: {
          $gte: startOfDay,
          $lt: endOfDay
        },
        status: { $in: ['Pending', 'Waiting'] }
      }),
      
      // Total Menu Items (active subcategories)
      SubCategory.countDocuments({
        status: 'active'
      })
    ])
    
    // Extract earnings and debits from aggregation results
    const earnings = todayEarnings.length > 0 ? todayEarnings[0].totalEarnings : 0;
    const debits = todayDebits.length > 0 ? todayDebits[0].totalDebits : 0;
    const debitCount = todayDebits.length > 0 ? todayDebits[0].count : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        todayOrders: {
          count: todayOrders,
          pending: pendingOrders
        },
        todayEarnings: {
          amount: earnings,
          formatted: `₹${earnings.toLocaleString('en-IN')}`
        },
        todayDebit: {
          amount: debits,
          formatted: `₹${debits.toLocaleString('en-IN')}`,
          count: debitCount
        },
        totalMenuItems: {
          count: totalMenuItems
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
