'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { themes } from './admin-theme'

const ThemeContext = createContext(null)

export function AdminThemeProvider({ children }) {
  const [mode, setMode] = useState('light')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('admin-theme') : null
    if (saved && themes[saved]) setMode(saved)
    setHydrated(true)
  }, [])

  function toggleTheme() {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-theme', next)
    }
  }

  const theme = themes[mode]

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, hydrated }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Fallback for any caller that's outside the provider — return dark theme.
    return { theme: themes.dark, mode: 'dark', toggleTheme: () => {}, hydrated: false }
  }
  return ctx
}
