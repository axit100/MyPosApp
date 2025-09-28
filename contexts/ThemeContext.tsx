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
    const isDark = theme === 'dark'

    root.classList.toggle('dark', isDark)
    root.classList.toggle('light', !isDark)
    body.classList.toggle('dark', isDark)
    body.classList.toggle('light', !isDark)

    root.style.colorScheme = theme
    body.dataset.theme = theme

    const lightThemeColor = document.querySelector('meta[name="theme-color"][media*="light"]')
    const darkThemeColor = document.querySelector('meta[name="theme-color"][media*="dark"]')

    const darkColor = '#111827'
    const lightColor = '#f3f4f6'
    const targetColor = isDark ? darkColor : lightColor

    if (lightThemeColor) lightThemeColor.setAttribute('content', targetColor)
    if (darkThemeColor) darkThemeColor.setAttribute('content', targetColor)

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
