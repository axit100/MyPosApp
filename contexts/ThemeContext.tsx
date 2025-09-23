"use client"

import { createContext, useContext, useEffect, useState, useMemo } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultValue = { theme: 'light' as Theme, toggleTheme: () => {} }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const body = document.body

    // Remove existing theme classes
    root.classList.remove('light', 'dark')

    // Add new theme class
    root.classList.add(theme)

    // Force apply styles directly for testing
    if (theme === 'dark') {
      body.style.backgroundColor = '#111827'
      body.style.color = '#f9fafb'

      // Apply dark styles to all white backgrounds
      const whiteElements = document.querySelectorAll('.bg-white')
      whiteElements.forEach(el => {
        (el as HTMLElement).style.backgroundColor = '#374151'
      })

      // Apply dark styles to all gray backgrounds
      const grayElements = document.querySelectorAll('.bg-gray-100')
      grayElements.forEach(el => {
        (el as HTMLElement).style.backgroundColor = '#111827'
      })

      // Apply dark text styles
      const darkTextElements = document.querySelectorAll('.text-gray-900')
      darkTextElements.forEach(el => {
        (el as HTMLElement).style.color = '#f9fafb'
      })
    } else {
      // Reset to light mode
      body.style.backgroundColor = '#f3f4f6'
      body.style.color = '#111827'

      // Reset all elements
      const allElements = document.querySelectorAll('[style]')
      allElements.forEach(el => {
        if (el !== body) {
          const element = el as HTMLElement
          element.style.backgroundColor = ''
          element.style.color = ''
        }
      })
    }

    // Set color scheme for native elements
    root.style.colorScheme = theme

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = useMemo(() => ({ theme, toggleTheme }), [theme])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={defaultValue}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
