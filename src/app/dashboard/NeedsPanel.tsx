import Link from 'next/link'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

const SUGGEST = {
  protein: ['Atún al natural', 'Huevo entero', 'Yogur griego'],
  carbs: ['Arroz blanco cocido', 'Avena tradicional seca', 'Banana'],
  fats: ['Palta', 'Almendras', 'Aceite de oliva'],
}

// Qué te falta hoy + sugerencias concretas de la base
export default async function NeedsPanel({ dateStr }: { dateStr: string }) {
  const session = await getSession()
  if (!session?.userId) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d, 0, 0, 0, 0)
  const [profile, summary] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.userId } }),
    db.dailySummary.findUnique({ where: { userId_date: { userId: session.userId, date: day } } }),
  ])
  if (!profile) return null

  const need = [
    { key: 'protein', label: 'proteína', unit: 'g', missing: (profile.targetProtein ?? 140) - (summary?.totalProtein ?? 0) },
    { key: 'carbs', label: 'carbos', unit: 'g', missing: (profile.targetCarbs ?? 250) - (summary?.totalCarbs ?? 0) },
    { key: 'fats', label: 'grasas', unit: 'g', missing: (profile.targetFats ?? 70) - (summary?.totalFats ?? 0) },
  ].filter((n) => n.missing > 0) as { key: keyof typeof SUGGEST; label: string; unit: string; missing: number }[]

  const needKcal = (profile.targetCalories || 2000) - (summary?.totalCalories ?? 0)

  if (need.length === 0 && needKcal <= 0) {
    return (
      <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
        <div style={{ fontWeight: 800 }}>Objetivos cubiertos 🎉</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Completaste calorías y macros de hoy.</div>
      </div>
    )
  }

  const foods = await db.food.findMany({
    where: { name: { in: [...SUGGEST.protein, ...SUGGEST.carbs, ...SUGGEST.fats] } },
  })
  const byName = new Map(foods.map((f) => [f.name, f]))

  return (
    <div className="card">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Qué te falta hoy</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {need.map((n) => (
          <div key={n.key}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              Te faltan {Math.round(n.missing)}{n.unit} de {n.label}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              {SUGGEST[n.key].map((name) => {
                const f = byName.get(name)
                if (!f) return null
                return (
                  <Link
                    key={name}
                    href={`/add-food?meal=lunch&date=${dateStr}`}
                    style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.75rem', borderRadius: '999px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', textDecoration: 'none' }}
                  >
                    {f.name} · {Math.round(f.calories)} kcal
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
        {needKcal > 0 && need.length === 0 && (
          <div style={{ fontSize: '0.875rem' }}>Te quedan {needKcal} kcal libres.</div>
        )}
      </div>
    </div>
  )
}
