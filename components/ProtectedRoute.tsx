"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  isActive: boolean
  isSuper?: boolean
}

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'manager' | 'staff')[]
  requireAuth?: boolean
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'manager', 'staff'], 
  requireAuth = true 
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user is logged in by calling an auth endpoint
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.user) {
          // Check if user is active
          if (!data.user.isActive) {
            // Logout inactive user
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include'
            })
            router.push('/login?error=account_inactive')
            return
          }

          setUser(data.user)
          
          // Check if user role is allowed
          if (allowedRoles.includes(data.user.role)) {
            setAuthorized(true)
          } else {
            router.push('/dashboard?error=unauthorized')
          }
        } else {
          if (requireAuth) {
            router.push('/login')
          } else {
            setAuthorized(true)
          }
        }
      } else {
        if (requireAuth) {
          router.push('/login')
        } else {
          setAuthorized(true)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      if (requireAuth) {
        router.push('/login')
      } else {
        setAuthorized(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}