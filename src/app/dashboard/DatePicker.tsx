'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toDateStr } from '@/lib/dates'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const WEEKDAYS = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO']

function parseKey(key: string): { y: number; m: number; d: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) {
    const t = new Date()
    return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() }
  }
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) }
}

export default function DatePicker({ current, trigger }: { current: string; trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const sel = parseKey(current)
  const [view, setView] = useState({ y: sel.y, m: sel.m })
  const wrapRef = useRef<HTMLDivElement>(null)

  const todayKey = toDateStr(new Date())

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open ])

  useEffect(() => {
    const s = parseKey(current)
    setView({ y: s.y, m: s.m })
  }, [current])

  const first = new Date(view.y, view.m, 1)
  const startOffset = (first.getDay() + 6) % 7 // lunes primero
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const go = (day: number) => {
    const key = toDateStr(new Date(view.y, view.m, day))
    setOpen(false)
    router.push(`/dashboard?date=${key}`)
  }

  const move = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {open && (
        <div
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 'calc(100% + 8px)', zIndex: 60,
            width: '280px', maxWidth: 'calc(100vw - 3rem)', backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)', borderRadius: '20px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)', padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
            <button type="button" onClick={() => move(-1)} aria-label="Mes anterior" style={{ padding: '0.4rem', color: 'var(--color-primary)', display: 'flex' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, textTransform: 'capitalize' }}>
              {MONTHS[view.m]} {view.y}
            </div>
            <button type="button" onClick={() => move(1)} aria-label="Mes siguiente" style={{ padding: '0.4rem', color: 'var(--color-primary)', display: 'flex' }}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-muted)', padding: '0.3rem 0' }}>
                {w}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const key = toDateStr(new Date(view.y, view.m, day))
              const isSelected = key === current
              const isToday = key === todayKey
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => go(day)}
                  style={{
                    aspectRatio: '1', borderRadius: '50%',
                    fontSize: '0.85rem', fontWeight: isSelected || isToday ? 800 : 500,
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                    color: isSelected ? '#fff' : isToday ? 'var(--color-primary)' : 'var(--color-text)',
                    border: !isSelected && isToday ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              router.push('/dashboard')
            }}
            style={{
              width: '100%', marginTop: '0.75rem', padding: '0.55rem',
              borderRadius: '12px', backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.85rem',
            }}
          >
            Hoy
          </button>
        </div>
      )}
    </div>
  )
}
