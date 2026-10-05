'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from 'lucide-react'
import { repeatDay } from './actions'

export default function RepeatDayButton({ from, to, label }: { from: string; to: string; label: string }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => {
        await repeatDay(from, to)
        router.refresh()
      })}
      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem' }}
    >
      <Copy size={15} /> {pending ? 'Copiando…' : label}
    </button>
  )
}
