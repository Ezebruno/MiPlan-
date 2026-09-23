'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const KEY = 'miplan-theme'

export function getStoredTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(KEY, next)
    } catch { /* noop */ }
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        position: 'fixed',
        top: '1rem',
        right: 'max(1rem, calc(50% - 240px + 1rem))',
        zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '40px', height: '40px', borderRadius: '50%',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
