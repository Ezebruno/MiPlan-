'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const DEFAULTS = { breakfast: '08:00', lunch: '13:00', snack: '17:00', dinner: '21:00' }
const LABELS: Record<string, string> = { breakfast: 'Desayuno', lunch: 'Almuerzo', snack: 'Merienda', dinner: 'Cena' }
const KEY = 'miplan-reminders'

// Recordatorios locales: avisa mientras la app está abierta (no requiere servidor push)
export default function Reminders() {
  const [enabled, setEnabled] = useState(false)
  const [times, setTimes] = useState(DEFAULTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setEnabled(!!parsed.enabled)
        setTimes({ ...DEFAULTS, ...parsed.times })
      }
    } catch { /* noop */ }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify({ enabled, times }))
    } catch { /* noop */ }
  }, [enabled, times, ready])

  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => {
      if (Notification.permission !== 'granted') return
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const today = now.toDateString()
      for (const [meal, t] of Object.entries(times)) {
        if (t !== hhmm) continue
        try {
          const fired = JSON.parse(localStorage.getItem(KEY + '-fired') ?? '{}')
          if (fired[meal] === today) continue
          fired[meal] = today
          localStorage.setItem(KEY + '-fired', JSON.stringify(fired))
          new Notification(`Hora del ${LABELS[meal]} 🍽️`, { body: 'Registrá tu comida en MiPlan' })
        } catch { /* noop */ }
      }
    }, 30000)
    return () => clearInterval(timer)
  }, [enabled, times])

  const toggle = async () => {
    if (!enabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    setEnabled((v) => !v)
  }

  if (!ready) return null

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recordatorios</h2>
        <button onClick={toggle} aria-label="Activar recordatorios" style={{ color: enabled ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex' }}>
          {enabled ? <Bell size={22} /> : <BellOff size={22} />}
        </button>
      </div>
      {!('Notification' in window) ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tu navegador no soporta notificaciones.</div>
      ) : enabled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {Object.entries(LABELS).map(([meal, label]) => (
            <div key={meal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>{label}</span>
              <input
                type="time"
                value={times[meal as keyof typeof times]}
                onChange={(e) => setTimes((t) => ({ ...t, [meal]: e.target.value }))}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
              />
            </div>
          ))}
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Avisan mientras la app está abierta.</div>
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Activá para que te avise a la hora de cada comida.</div>
      )}
    </div>
  )
}
