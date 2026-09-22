import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProgressPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const weights = await db.weightLog.findMany({
    where: { userId: session.userId },
    orderBy: { date: 'asc' },
    take: 30,
  })
  const summaries = await db.dailySummary.findMany({
    where: { userId: session.userId },
    orderBy: { date: 'desc' },
    take: 7,
  })
  const maxW = Math.max(...weights.map(w => w.weight), 0)
  const minW = Math.min(...weights.map(w => w.weight), maxW)

  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Progreso</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>Tu evolución de peso y constancia.</p>

      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Peso ({weights.length} registros)</h2>
        {weights.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Todavía no registraste tu peso. Hacelo desde el dashboard.</p>
        ) : (
          <svg viewBox="0 0 300 120" style={{ width: '100%', height: '120px' }}>
            {weights.map((w, i) => {
              const x = weights.length === 1 ? 150 : (i / (weights.length - 1)) * 280 + 10
              const range = Math.max(1, maxW - minW)
              const y = 110 - ((w.weight - minW) / range) * 90 - 5
              return <circle key={w.id} cx={x} cy={y} r="4" fill="var(--color-primary)" />
            })}
            <polyline
              fill="none" stroke="var(--color-primary)" strokeWidth="2"
              points={weights.map((w, i) => {
                const x = weights.length === 1 ? 150 : (i / (weights.length - 1)) * 280 + 10
                const range = Math.max(1, maxW - minW)
                const y = 110 - ((w.weight - minW) / range) * 90 - 5
                return `${x},${y}`
              }).join(' ')}
            />
          </svg>
        )}
        {weights.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            <span>{weights[0].weight} kg</span>
            <span>{weights[weights.length - 1].weight} kg</span>
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Últimos 7 días (kcal)</h2>
        {summaries.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Sin datos todavía.</p>}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
          {[...summaries].reverse().map(s => {
            const h = Math.min(100, (s.totalCalories / 2500) * 100)
            return (
              <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', height: `${Math.max(4, h)}px`, backgroundColor: 'var(--color-primary)', borderRadius: '6px' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{new Date(s.date).getDate()}/{new Date(s.date).getMonth() + 1}</span>
              </div>
            )
          })}
        </div>
      </div>

      <Link href="/dashboard" className="btn-secondary" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
      <div className="bottom-spacer" />
    </main>
  )
}
