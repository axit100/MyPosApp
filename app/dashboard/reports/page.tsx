"use client"

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Download
} from "lucide-react"
import DashboardHeader from '@/components/DashboardHeader'

interface ReportData {
  dailySales: {
    date: string
    revenue: number
    orders: number
  }[]
  topItems: {
    name: string
    quantity: number
    revenue: number
  }[]
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    topSellingItem: string
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('7days')

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      // For now, we'll use mock data since we don't have a reports API yet
      // In a real app, you'd fetch from /api/reports
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: ReportData = {
        dailySales: [
          { date: '2024-01-15', revenue: 15420, orders: 45 },
          { date: '2024-01-16', revenue: 18750, orders: 52 },
          { date: '2024-01-17', revenue: 12300, orders: 38 },
          { date: '2024-01-18', revenue: 21500, orders: 61 },
          { date: '2024-01-19', revenue: 19800, orders: 55 },
          { date: '2024-01-20', revenue: 23400, orders: 67 },
          { date: '2024-01-21', revenue: 17600, orders: 49 }
        ],
        topItems: [
          { name: 'Butter Chicken', quantity: 45, revenue: 13500 },
          { name: 'Dal Makhani', quantity: 38, revenue: 9500 },
          { name: 'Naan Bread', quantity: 67, revenue: 6700 },
          { name: 'Biryani', quantity: 23, revenue: 11500 },
          { name: 'Paneer Tikka', quantity: 31, revenue: 9300 }
        ],
        summary: {
          totalRevenue: 128770,
          totalOrders: 367,
          averageOrderValue: 351,
          topSellingItem: 'Butter Chicken'
        }
      }
      
      setReportData(mockData)
    } catch (error) {
      setError('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchReportData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardHeader
        title="Sales Reports"
        subtitle="Analyze restaurant performance and trends"
        showBackButton={true}
        onRefresh={fetchReportData}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Date Range Selector */}
        <div className="flex justify-end">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ₹{reportData?.summary.totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
            </div>
          </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData?.summary.totalOrders}
              </p>
              <p className="text-sm text-blue-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{reportData?.summary.averageOrderValue}
              </p>
              <p className="text-sm text-purple-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.8%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Top Item</p>
              <p className="text-lg font-bold text-gray-900">
                {reportData?.summary.topSellingItem}
              </p>
              <p className="text-sm text-orange-600">
                Best seller
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales</h3>
          <div className="space-y-3">
            {reportData?.dailySales.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">
                    {day.orders} orders
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    ₹{day.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-4">
            {reportData?.topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-orange-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} sold
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  ₹{item.revenue.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Reports */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-900">Sales by Category</span>
            </div>
            <p className="text-sm text-gray-600">View revenue breakdown by menu categories</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-gray-900">Staff Performance</span>
            </div>
            <p className="text-sm text-gray-600">Analyze individual staff sales performance</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Peak Hours</span>
            </div>
            <p className="text-sm text-gray-600">Identify busiest times and optimize staffing</p>
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
