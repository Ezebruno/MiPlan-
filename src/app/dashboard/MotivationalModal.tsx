'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getQuoteOfDay } from '@/lib/quotes'
import { todayStr } from '@/lib/dates'

const KEY = 'miplan-quote-date'

export default function MotivationalModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== todayStr()) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  if (!show) return null

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, todayStr())
    } catch { /* noop */ }
    setShow(false)
  }

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ maxWidth: '340px', width: '100%', textAlign: 'center', padding: '2rem 1.5rem' }}
      >
        <Sparkles size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem' }} />
        <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '1.5rem' }}>
          “{getQuoteOfDay()}”
        </p>
        <button onClick={dismiss} className="btn-primary" style={{ width: '100%' }}>
          Vamos 💪
        </button>
      </div>
    </div>
  )
}
