"use client"

import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Sun,
  Moon,
  RotateCcw
} from "lucide-react"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onRefresh?: () => void
}

export default function DashboardHeader({
  title,
  subtitle,
  showBackButton = false,
  onRefresh
}: DashboardHeaderProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [restaurantName, setRestaurantName] = useState<string>(
    process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'Dhabha POS'
  )

  const systemName = process.env.NEXT_PUBLIC_SYSTEM_NAME || 'Restaurant Management System'

  // Fetch restaurant name from settings
  useEffect(() => {
    const fetchRestaurantName = async () => {
      try {
        const response = await fetch('/api/settings')
        const result = await response.json()

        if (result.success && result.data?.restaurantName) {
          setRestaurantName(result.data.restaurantName)
        }
        // If no restaurant name in settings, keep the environment variable fallback
      } catch (error) {
        console.error('Failed to fetch restaurant name from settings:', error)
        // Keep the environment variable fallback
      }
    }

    fetchRestaurantName()
  }, [])

  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      router.back()
    } else {
      // If no history, redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {showBackButton && (
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {showBackButton ? title : restaurantName}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {showBackButton ? subtitle : systemName}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
