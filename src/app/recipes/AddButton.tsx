'use client'

import { useState, useTransition } from 'react'
import { Plus, Check } from 'lucide-react'
import { logFood } from '@/app/add-food/actions'
import { todayStr } from '@/lib/dates'

interface Props {
  mealType: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export default function AddRecipeButton({ mealType, name, calories, protein, carbs, fats }: Props) {
  const [added, setAdded] = useState(false)
  const [isPending, start] = useTransition()

  if (added) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
        <Check size={16} /> Agregado
      </span>
    )
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        start(async () => {
          await logFood({
            date: todayStr(),
            mealType,
            foodName: name,
            quantity: 1, // 1 porción (ver MealSection)
            calories,
            protein,
            carbs,
            fats,
          })
          setAdded(true)
        })
      }
      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem' }}
    >
      <Plus size={16} /> {isPending ? 'Sumando...' : 'Agregar'}
    </button>
  )
}
