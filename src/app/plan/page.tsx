import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PlanDayButton, { PlanMeal } from './PlanDayButton'
import { addDays, toDateStr, formatLong } from '@/lib/dates'

const POOLS: { key: string; terms: string[] }[] = [
  { key: 'proteina', terms: ['Pollo', 'Carne vacuna', 'Atún', 'Merluza', 'Huevo', 'Lentejas'] },
  { key: 'base', terms: ['Arroz', 'Fideos', 'Papa', 'Polenta', 'Quinoa'] },
  { key: 'verdura', terms: ['Ensalada', 'Lechuga', 'Tomate', 'Zapallito', 'Berenjena', 'Verduras asadas', 'Rúcula'] },
  { key: 'desayuno', terms: ['Huevo', 'Avena', 'Yogur', 'Pan', 'Leche', 'Granola', 'Tostada', 'Banana'] },
  { key: 'snack', terms: ['Banana', 'Manzana', 'Yogur', 'Naranja', 'Mandarina', 'Pera'] },
]

// Match estricto por inicio de nombre: evita falsos positivos como
// "panceta"→Pan, "dulce de leche"→Leche o "sardinas en tomate"→Verdura.
function matches(name: string, term: string): boolean {
  return name.toLowerCase().startsWith(term.toLowerCase())
}

// Exclusiones: crudos no comestibles así nomás y falsos positivos residuales
const EXCLUDED = new Set([
  'Papaya',
  'Panceta ahumada',
  'Pancho',
  'Pan rallado',
  'Pan de hamburguesa',
  'Pan de pancho',
  'Leche condensada',
])
function edible(name: string): boolean {
  return !EXCLUDED.has(name) && !/\bcrud[oa]s?\b/i.test(name)
}

function parseGrams(servingSize: string | null): number {
  if (!servingSize) return 100
  const m = servingSize.match(/(\d+)\s*g(?:\s|\)|$)/i)
  if (m) return Number(m[1])
  const ml = servingSize.match(/(\d+)\s*ml/i)
  if (ml) return Number(ml[1])
  return 100
}

const DAY_MEALS = [
  { mealType: 'breakfast', label: 'Desayuno' },
  { mealType: 'lunch', label: 'Almuerzo' },
  { mealType: 'snack', label: 'Merienda' },
  { mealType: 'dinner', label: 'Cena' },
]

export default async function PlanPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const profile = await db.profile.findUnique({ where: { userId: session.userId } })
  if (!profile) redirect('/onboarding')
  const target = profile.targetCalories || 2000

  const allTerms = [...new Set(POOLS.flatMap((p) => p.terms))]
  const candidates = await db.food.findMany({
    where: { OR: allTerms.map((t) => ({ name: { contains: t, mode: 'insensitive' as const } })) },
    take: 400,
    orderBy: { name: 'asc' },
  })

  // Cada alimento al primer grupo que lo matchee (sin repetir entre grupos)
  const buckets = new Map<string, typeof candidates>()
  const used = new Set<string>()
  for (const pool of POOLS) {
    const list = candidates.filter(
      (f) => !used.has(f.id) && edible(f.name) && pool.terms.some((t) => matches(f.name, t))
    )
    for (const f of list) used.add(f.id)
    buckets.set(pool.key, list)
  }
  const pick = (key: string, i: number) => {
    const list = buckets.get(key) ?? []
    return list.length ? list[i % list.length] : null
  }
  const toItem = (f: (typeof candidates)[number]) => ({
    foodName: f.name,
    quantity: parseGrams(f.servingSize),
    calories: Math.round(f.calories),
    protein: Math.round(f.protein),
    carbs: Math.round(f.carbs),
    fats: Math.round(f.fat),
  })

  const start = new Date()
  const days = Array.from({ length: 7 }, (_, d) => {
    const date = toDateStr(addDays(start, d))
    const meals: PlanMeal[] = [
      { mealType: 'breakfast', label: 'Desayuno', items: [pick('desayuno', d), pick('desayuno', d + 3)].filter((x): x is NonNullable<typeof x> => !!x).map(toItem) },
      { mealType: 'lunch', label: 'Almuerzo', items: [pick('proteina', d), pick('base', d + 1), pick('verdura', d + 2)].filter((x): x is NonNullable<typeof x> => !!x).map(toItem) },
      { mealType: 'snack', label: 'Merienda', items: [pick('snack', d + 1)].filter((x): x is NonNullable<typeof x> => !!x).map(toItem) },
      { mealType: 'dinner', label: 'Cena', items: [pick('proteina', d + 3), pick('verdura', d)].filter((x): x is NonNullable<typeof x> => !!x).map(toItem) },
    ]
    const kcal = meals.reduce((s, m) => s + m.items.reduce((a, i) => a + i.calories, 0), 0)
    return { date, label: d === 0 ? 'Hoy' : formatLong(addDays(start, d)), meals, kcal }
  })

  // Lista de compras: conteo de porciones por alimento en la semana
  const shopping = new Map<string, number>()
  for (const day of days) {
    for (const m of day.meals) {
      for (const i of m.items) shopping.set(i.foodName, (shopping.get(i.foodName) ?? 0) + 1)
    }
  }

  return (
    <main className="screen-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/dashboard" style={{ padding: '0.5rem' }}><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Plan semanal</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Generado con tu base · objetivo {target} kcal/día
          </p>
        </div>
      </div>

      {days.map((day) => (
        <div key={day.date} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize' }}>{day.label}</h2>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: day.kcal > target ? 'var(--color-error)' : 'var(--color-primary)' }}>
              {day.kcal} kcal
            </span>
          </div>
          {DAY_MEALS.map(({ mealType, label }) => {
            const m = day.meals.find((x) => x.mealType === mealType)
            if (!m || m.items.length === 0) return null
            return (
              <div key={mealType} style={{ fontSize: '0.85rem', padding: '0.25rem 0' }}>
                <span style={{ fontWeight: 700 }}>{label}: </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{m.items.map((i) => i.foodName).join(' · ')}</span>
              </div>
            )
          })}
          <PlanDayButton date={day.date} meals={day.meals} />
        </div>
      ))}

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>🛒 Lista de compras</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Porciones para toda la semana:
        </div>
        {[...shopping.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => (
          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0', borderBottom: '1px solid var(--color-border)' }}>
            <span>{name}</span>
            <strong>×{count}</strong>
          </div>
        ))}
      </div>
      <div className="bottom-spacer" />
    </main>
  )
}
