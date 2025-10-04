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
import ProtectedRoute from '@/components/ProtectedRoute'

interface ReportData {
  dailySales: {
    date: string
    revenue: number
    orders: number
    credits: number
    debits: number
    netProfit: number
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
    netProfit: number
    revenueGrowth: number
    ordersGrowth: number
    profitMargin: string
  }
  cashFlow: {
    totalCredits: number
    totalDebits: number
    netCashFlow: number
    creditTransactions: number
    debitTransactions: number
  }
  recentCashNotes: {
    _id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    date: string
  }[]
  dateRange: {
    from: string
    to: string
    days: number
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [dateRange])
  
  useEffect(() => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      fetchReportData()
    }
  }, [customStartDate, customEndDate])
  
  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    setShowCustomRange(value === 'custom')
    setError('') // Clear any previous errors
  }

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError('')
      
      let url = '/api/reports'
      
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        // Validate date range (max 1 year)
        const start = new Date(customStartDate)
        const end = new Date(customEndDate)
        const oneYear = 365 * 24 * 60 * 60 * 1000 // milliseconds in a year
        
        if (end.getTime() - start.getTime() > oneYear) {
          setError('Date range cannot exceed 1 year')
          setLoading(false)
          return
        }
        
        if (start > end) {
          setError('Start date must be before end date')
          setLoading(false)
          return
        }
        
        url += `?startDate=${customStartDate}&endDate=${customEndDate}`
      } else if (dateRange === 'today') {
        const today = new Date().toISOString().split('T')[0]
        url += `?startDate=${today}&endDate=${today}`
      } else {
        url += `?dateRange=${dateRange}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      
      const data: ReportData = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Report fetch error:', error)
      setError('Failed to fetch report data. Please try again.')
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
    <ProtectedRoute allowedRoles={['admin', 'manager']}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardHeader
          title="Sales Reports"
          subtitle="Analyze restaurant performance and trends"
          showBackButton={true}
          onRefresh={fetchReportData}
        />

      <div className="px-4 py-4 space-y-4">
        {/* Date Range Selector */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {reportData?.dateRange && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {reportData.dateRange.days === 1 && dateRange === 'today' ? (
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      Today's Report - {new Date(reportData.dateRange.from).toLocaleDateString('en-IN')}
                    </span>
                  ) : reportData.dateRange.days === 1 ? (
                    <span>
                      Single day report - {new Date(reportData.dateRange.from).toLocaleDateString('en-IN')}
                    </span>
                  ) : (
                    <span>
                      Showing data from {new Date(reportData.dateRange.from).toLocaleDateString('en-IN')} 
                      to {new Date(reportData.dateRange.to).toLocaleDateString('en-IN')} 
                      ({reportData.dateRange.days} days)
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-[180px]"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year (Max)</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {showCustomRange && (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>
          </div>
          
          {showCustomRange && (
            <div className="space-y-3">
              {(!customStartDate || !customEndDate) && (
                <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Please select both start and end dates for custom range (max 1 year apart)
                  </div>
                </div>
              )}
              
              {/* Quick Date Presets for Custom Range */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick select:</span>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    setCustomStartDate(today)
                    setCustomEndDate(today)
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 6)
                    setCustomStartDate(start.toISOString().split('T')[0])
                    setCustomEndDate(end.toISOString().split('T')[0])
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setDate(start.getDate() - 29)
                    setCustomStartDate(start.toISOString().split('T')[0])
                    setCustomEndDate(end.toISOString().split('T')[0])
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => {
                    const end = new Date()
                    const start = new Date()
                    start.setMonth(start.getMonth() - 1)
                    setCustomStartDate(start.toISOString().split('T')[0])
                    setCustomEndDate(end.toISOString().split('T')[0])
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-300 transition-colors"
                >
                  This Month
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className={`text-sm flex items-center ${
                  (reportData?.summary.revenueGrowth || 0) >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(reportData?.summary.revenueGrowth || 0) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {(reportData?.summary.revenueGrowth || 0) >= 0 ? '+' : ''}{(reportData?.summary.revenueGrowth || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {reportData?.summary.totalOrders}
                </p>
                <p className={`text-sm flex items-center ${
                  (reportData?.summary.ordersGrowth || 0) >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(reportData?.summary.ordersGrowth || 0) >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {(reportData?.summary.ordersGrowth || 0) >= 0 ? '+' : ''}{(reportData?.summary.ordersGrowth || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                (reportData?.summary.netProfit || 0) >= 0
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  (reportData?.summary.netProfit || 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Net Profit</p>
                <p className={`text-2xl font-bold ${
                  (reportData?.summary.netProfit || 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ₹{reportData?.summary.netProfit.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reportData?.summary.profitMargin}% margin
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ₹{reportData?.summary.averageOrderValue}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {reportData?.summary.topSellingItem}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            Cash Flow Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Credits</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                ₹{reportData?.cashFlow.totalCredits.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {reportData?.cashFlow.creditTransactions} transactions
              </p>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Debits</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">
                ₹{reportData?.cashFlow.totalDebits.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {reportData?.cashFlow.debitTransactions} transactions
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              (reportData?.cashFlow.netCashFlow || 0) >= 0
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              <p className={`text-sm font-medium ${
                (reportData?.cashFlow.netCashFlow || 0) >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                Net Cash Flow
              </p>
              <p className={`text-xl font-bold ${
                (reportData?.cashFlow.netCashFlow || 0) >= 0
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                ₹{reportData?.cashFlow.netCashFlow.toLocaleString('en-IN')}
              </p>
              <p className={`text-xs ${
                (reportData?.cashFlow.netCashFlow || 0) >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {(reportData?.cashFlow.netCashFlow || 0) >= 0 ? 'Positive flow' : 'Negative flow'}
              </p>
            </div>
          </div>
        </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales & Profit Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily Sales & Profit</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reportData?.dailySales.slice(-10).map((day, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(day.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {day.orders} orders
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Revenue: </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ₹{day.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Net Profit: </span>
                    <span className={`font-bold ${
                      day.netProfit >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{day.netProfit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                {(day.credits > 0 || day.debits > 0) && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-xs">
                      {day.credits > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          +₹{day.credits.toLocaleString('en-IN')} credit
                        </span>
                      )}
                      {day.debits > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          -₹{day.debits.toLocaleString('en-IN')} debit
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items & Recent Cash Notes */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Selling Items</h3>
            <div className="space-y-4">
              {reportData?.topItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.quantity} sold
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    ₹{item.revenue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Cash Notes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Cash Notes</h3>
            <div className="space-y-3">
              {reportData?.recentCashNotes.slice(0, 5).map((note, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      note.type === 'credit'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {note.description || `${note.type} transaction`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(note.date).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    note.type === 'credit'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {note.type === 'credit' ? '+' : '-'}₹{note.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      </div>
      </div>
    </ProtectedRoute>
  )
}
