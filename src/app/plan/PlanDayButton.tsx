'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { logFood } from '../add-food/actions'

export interface PlanItem {
  foodName: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface PlanMeal {
  mealType: string
  label: string
  items: PlanItem[]
}

export default function PlanDayButton({ date, meals }: { date: string; meals: PlanMeal[] }) {
  const [pending, start] = useTransition()
  const router = useRouter()
  const total = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.calories, 0), 0)

  return (
    <button
      onClick={() => start(async () => {
        for (const m of meals) {
          for (const i of m.items) {
            await logFood({ date, mealType: m.mealType, ...i })
          }
        }
        router.push(`/dashboard?date=${date}`)
      })}
      className="btn-primary"
      disabled={pending}
      style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
    >
      {pending ? 'Registrando…' : <><Plus size={18} /> Registrar este día ({total} kcal)</>}
    </button>
  )
}
