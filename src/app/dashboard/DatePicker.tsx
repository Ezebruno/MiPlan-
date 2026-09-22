'use client'

import { useRouter } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { useRef } from 'react'

export default function DatePicker({ current }: { current: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        aria-label="Elegir fecha"
        title="Elegir fecha"
        onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.focus()}
        style={{ padding: '0.5rem', color: 'var(--color-primary)' }}
      >
        <CalendarDays size={22} />
      </button>
      <input
        ref={inputRef}
        type="date"
        defaultValue={current}
        aria-label="Calendario"
        onChange={(e) => {
          if (e.target.value) router.push(`/dashboard?date=${e.target.value}`)
        }}
        style={{ width: '1px', height: '1px', opacity: 0, position: 'absolute', pointerEvents: 'none' }}
      />
    </>
  )
}
