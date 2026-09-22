'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { deleteMealItemDirect, deleteMealDirect } from './deleteActions'

export function DeleteItemButton({ itemId, date }: { itemId: string; date: string }) {
  const [state, setState] = useState<'idle' | 'confirm'>('idle')
  const [pending, start] = useTransition()

  if (state === 'confirm') {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
        <button
          disabled={pending}
          onClick={() => start(async () => {
            await deleteMealItemDirect(itemId)
            window.location.href = `/dashboard?date=${date}`
          })}
          style={{
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            backgroundColor: 'var(--color-error)', borderRadius: '6px',
            padding: '2px 8px', lineHeight: '18px', flexShrink: 0,
          }}
        >
          {pending ? '…' : 'Sí'}
        </button>
        <button
          onClick={() => setState('idle')}
          style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-border)', borderRadius: '6px',
            padding: '2px 8px', lineHeight: '18px', flexShrink: 0,
          }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirm')}
      title="Eliminar alimento"
      style={{ color: 'var(--color-text-muted)', padding: '2px', flexShrink: 0 }}
    >
      <X size={14} />
    </button>
  )
}

export function DeleteMealButton({ mealId, mealType, date }: { mealId: string; mealType: string; date: string }) {
  const [state, setState] = useState<'idle' | 'confirm'>('idle')
  const [pending, start] = useTransition()
  const labels: Record<string, string> = { breakfast: 'Desayuno', lunch: 'Almuerzo', snack: 'Merienda', dinner: 'Cena', other: 'Otro' }

  if (state === 'confirm') {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
        <button
          disabled={pending}
          onClick={() => start(async () => {
            await deleteMealDirect(mealId)
            window.location.href = `/dashboard?date=${date}`
          })}
          style={{
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            backgroundColor: 'var(--color-error)', borderRadius: '6px',
            padding: '2px 8px', lineHeight: '18px', flexShrink: 0,
          }}
        >
          {pending ? '…' : 'Borrar todo'}
        </button>
        <button
          onClick={() => setState('idle')}
          style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-border)', borderRadius: '6px',
            padding: '2px 8px', lineHeight: '18px', flexShrink: 0,
          }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirm')}
      title={`Eliminar todo el ${labels[mealType] || mealType}`}
      style={{ color: 'var(--color-error)', fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, flexShrink: 0 }}
    >
      Borrar
    </button>
  )
}
