import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LogPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const meals = await db.meal.findMany({
    where: { userId: session.userId, date: { gte: today, lt: tomorrow } },
    include: { items: true },
    orderBy: { createdAt: 'asc' },
  })
  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Diario</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>Todo lo que registraste hoy.</p>
      {meals.length === 0 && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Nada por aquí todavía.</p>
          <Link href="/dashboard" className="btn-primary" style={{ marginTop: '1rem' }}>Registrar comida</Link>
        </div>
      )}
      {meals.map(m => (
        <div key={m.id} className="card">
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', textTransform: 'capitalize' }}>{m.mealType} · {m.items.reduce((s, i) => s + i.calories, 0)} kcal</div>
          {m.items.map(i => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.4rem 0', borderTop: '1px solid var(--color-border)' }}>
              <span>{i.foodName} ({i.quantity}g)</span>
              <b>{i.calories} kcal</b>
            </div>
          ))}
        </div>
      ))}
      <Link href="/dashboard" className="btn-secondary" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
      <div className="bottom-spacer" />
    </main>
  )
}
