"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ShoppingCart,
  DollarSign,
  Utensils,
  ChevronRight,
  BarChart3,
  Settings,
  UserCheck
} from "lucide-react"

interface DashboardData {
  todayOrders: {
    count: number
    pending: number
  }
  todayEarnings: {
    amount: number
    formatted: string
  }
  todayDebit: {
    amount: number
    formatted: string
    count: number
  }
  totalMenuItems: {
    count: number
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const result = await response.json()

      if (response.ok) {
        setDashboardData(result.data)
      } else {
        setError(result.error || 'Failed to fetch dashboard data')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      title: 'Orders',
      description: 'View and manage all orders',
      icon: ShoppingCart,
      route: '/dashboard/orders',
      color: 'bg-green-500'
    },
    {
      title: 'Cash Management',
      description: 'Manage cash flow and transactions',
      icon: DollarSign,
      route: '/dashboard/cash-management',
      color: 'bg-blue-500'
    },
    {
      title: 'Menu',
      description: 'Manage menu categories and items',
      icon: Utensils,
      route: '/dashboard/menu',
      color: 'bg-orange-500'
    },
    {
      title: 'Reports',
      description: 'Sales analytics and insights',
      icon: BarChart3,
      route: '/dashboard/reports',
      color: 'bg-purple-500'
    },
    {
      title: 'Staff',
      description: 'Manage restaurant staff',
      icon: UserCheck,
      route: '/dashboard/users',
      color: 'bg-indigo-500'
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: Settings,
      route: '/dashboard/settings',
      color: 'bg-gray-500'
    }
  ]

  return (
    <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardHeader
          title="Dhabha POS"
          subtitle="Restaurant Management System"
          onRefresh={fetchDashboardData}
        />

      {/* Dashboard Metrics */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Today Debit */}
          <button 
            onClick={() => router.push('/dashboard/cash-management')}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Today&apos;s Debit</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {dashboardData?.todayDebit?.formatted || '₹0'}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {dashboardData?.todayDebit?.count || 0} transactions
                </p>
              </div>
            </div>
          </button>

          {/* Today's Orders */}
          <button 
            onClick={() => router.push('/dashboard/orders')}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Today&apos;s Orders</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {dashboardData?.todayOrders.count || 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {dashboardData?.todayOrders.pending || 0} pending
                </p>
              </div>
            </div>
          </button>

          {/* Today's Earnings */}
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Today&apos;s Earnings</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {dashboardData?.todayEarnings.formatted || '₹0'}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  View reports
                </p>
              </div>
            </div>
          </button>

          {/* Total Menu Items */}
          <button 
            onClick={() => router.push('/dashboard/menu')}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Utensils className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Menu Items</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {dashboardData?.totalMenuItems.count || 0}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Manage menu
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-1">Quick Access</h2>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => router.push(item.route)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                tabIndex={0}
                aria-label={item.title}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 ${item.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
