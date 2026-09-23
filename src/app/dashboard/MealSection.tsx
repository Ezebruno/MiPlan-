'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { DeleteMealButton, DeleteItemButton } from './DeleteButtons'

interface MealItem {
  id: string
  foodName: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fats: number
}

interface Meal {
  id: string
  mealType: string
  items: MealItem[]
}

interface Props {
  id: string
  label: string
  meal: Meal | undefined
  dateStr: string
}

export default function MealSection({ id, label, meal, dateStr }: Props) {
  const [open, setOpen] = useState(true)
  const mealCalories = meal?.items.reduce((s, i) => s + i.calories, 0) ?? 0
  const mealProtein = meal?.items.reduce((s, i) => s + i.protein, 0) ?? 0
  const mealCarbs = meal?.items.reduce((s, i) => s + i.carbs, 0) ?? 0
  const mealFats = meal?.items.reduce((s, i) => s + i.fats, 0) ?? 0
  const hasItems = meal && meal.items.length > 0

  return (
    <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          onClick={() => hasItems && setOpen(!open)}
          style={{ cursor: hasItems ? 'pointer' : 'default', flex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {hasItems && (
              open ? <ChevronDown size={16} color="var(--color-text-muted)" /> : <ChevronRight size={16} color="var(--color-text-muted)" />
            )}
            <span style={{ fontWeight: 600 }}>{label}</span>
          </div>
          {mealCalories > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', paddingLeft: hasItems ? '1.4rem' : 0 }}>
              {mealCalories} kcal · {mealProtein}g proteína · {mealCarbs}g carbos · {mealFats}g grasa
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {hasItems && (
            <DeleteMealButton mealId={meal!.id} mealType={id} date={dateStr} />
          )}
          <Link href={`/add-food?meal=${id}&date=${dateStr}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
            <Plus size={16} /> Agregar
          </Link>
        </div>
      </div>

      {/* Items (colapsable) */}
      {open && hasItems && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {meal!.items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', paddingLeft: '0.5rem' }}>
              <span>· {item.foodName} ({item.quantity === 1 ? '1 porción' : `${item.quantity}g`})</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{item.calories} kcal</span>
                <DeleteItemButton itemId={item.id} date={dateStr} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
