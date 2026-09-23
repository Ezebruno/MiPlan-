import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Flame, UtensilsCrossed, Dumbbell, Droplets, Scale } from 'lucide-react'
import { logWeightForm } from './actions'
import { toDateStr, addDays } from '@/lib/dates'

const DAY_LETTERS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export default async function ProgressPage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = addDays(today, -6)

  const [weights, summaries, profile, exerciseLogs] = await Promise.all([
    db.weightLog.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'asc' },
      take: 30,
    }),
    db.dailySummary.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      take: 30,
    }),
    db.profile.findUnique({ where: { userId: session.userId } }),
    db.exerciseLog.findMany({
      where: { userId: session.userId, date: { gte: weekAgo } },
    }),
  ])

  if (!profile) redirect('/onboarding')

  // Racha: días consecutivos con actividad (hasta hoy o ayer)
  const activeDays = new Set(summaries.map((s) => toDateStr(new Date(s.date))))
  let streak = 0
  const cursor = new Date(today)
  if (!activeDays.has(toDateStr(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (activeDays.has(toDateStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Semana completa (7 días, rellena faltantes con 0)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6)
    const key = toDateStr(d)
    const s = summaries.find((x) => toDateStr(new Date(x.date)) === key)
    const exKcal = exerciseLogs
      .filter((l) => toDateStr(new Date(l.date)) === key)
      .reduce((a, l) => a + l.kcal, 0)
    return {
      key,
      letter: DAY_LETTERS[d.getDay()],
      num: `${d.getDate()}/${d.getMonth() + 1}`,
      kcal: s?.totalCalories ?? 0,
      burned: exKcal,
      hasData: !!s || exKcal > 0,
    }
  })

  const kcalValues = week.filter((d) => d.hasData).map((d) => d.kcal)
  const avgKcal = kcalValues.length ? Math.round(kcalValues.reduce((a, b) => a + b, 0) / kcalValues.length) : 0
  const weekExerciseMin = exerciseLogs.reduce((a, l) => a + l.minutes, 0)
  const waterValues = summaries.slice(0, 7).map((s) => s.waterMl ?? 0)
  const avgWater = waterValues.length ? (waterValues.reduce((a, b) => a + b, 0) / waterValues.length / 1000).toFixed(1) : '0'
  const target = profile.targetCalories || 2000
  const maxBar = Math.max(target, ...week.map((d) => d.kcal), 1)

  // Peso
  const firstW = weights[0]?.weight
  const lastW = weights[weights.length - 1]?.weight
  const diff = firstW !== undefined && lastW !== undefined ? lastW - firstW : 0
  const maxW = Math.max(...weights.map((w) => w.weight), 0)
  const minW = Math.min(...weights.map((w) => w.weight), maxW)

  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Progreso</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>Tu constancia de los últimos 7 días.</p>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <StatCard icon={<Flame size={18} color="var(--color-primary)" />} value={streak > 0 ? `${streak} ${streak === 1 ? 'día' : 'días'}` : '—'} label="Racha" />
        <StatCard icon={<UtensilsCrossed size={18} color="var(--color-primary)" />} value={avgKcal > 0 ? `${avgKcal}` : '—'} label="Kcal prom/día" />
        <StatCard icon={<Dumbbell size={18} color="var(--color-primary)" />} value={weekExerciseMin > 0 ? `${weekExerciseMin} min` : '—'} label="Ejercicio semanal" />
        <StatCard icon={<Droplets size={18} color="var(--color-primary)" />} value={Number(avgWater) > 0 ? `${avgWater} L` : '—'} label="Agua prom/día" />
      </div>

      {/* PESO */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Scale size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Peso</h2>
          {weights.length > 1 && (
            <span style={{
              marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700,
              color: diff <= 0 ? 'var(--color-primary)' : 'var(--color-error)',
            }}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
            </span>
          )}
        </div>
        {weights.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Todavía no registraste tu peso. Pesate y anotalo para ver tu evolución.
          </p>
        ) : (
          <>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {lastW} kg
            </div>
            <svg viewBox="0 0 300 120" style={{ width: '100%', height: '120px' }}>
              <polyline
                fill="none" stroke="var(--color-primary)" strokeWidth="2"
                points={weights.map((w, i) => {
                  const x = weights.length === 1 ? 150 : (i / (weights.length - 1)) * 280 + 10
                  const range = Math.max(1, maxW - minW)
                  const y = 110 - ((w.weight - minW) / range) * 90 - 5
                  return `${x},${y}`
                }).join(' ')}
              />
              {weights.map((w, i) => {
                const x = weights.length === 1 ? 150 : (i / (weights.length - 1)) * 280 + 10
                const range = Math.max(1, maxW - minW)
                const y = 110 - ((w.weight - minW) / range) * 90 - 5
                return <circle key={w.id} cx={x} cy={y} r="4" fill="var(--color-primary)" />
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              <span>{firstW} kg</span>
              <span>{weights.length} registros</span>
              <span>{lastW} kg</span>
            </div>
          </>
        )}
        <form action={logWeightForm} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            name="weight"
            type="number"
            step="0.1"
            min="20"
            max="500"
            required
            placeholder={`Tu peso hoy (kg)${lastW ? ` · último: ${lastW}` : ''}`}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '1rem' }}
          />
          <button type="submit" className="btn-primary" style={{ fontSize: '1rem', padding: '0.75rem' }}>
            Registrar
          </button>
        </form>
      </div>

      {/* SEMANA KCAL */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Calorías por día</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Línea: objetivo {target} kcal
        </p>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '130px' }}>
            {week.map((d) => {
              const h = Math.max(4, (d.kcal / maxBar) * 110)
              const over = d.kcal > target
              return (
                <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: over ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                    {d.hasData ? d.kcal : ''}
                  </span>
                  <div style={{
                    width: '100%', height: `${h}px`,
                    backgroundColor: !d.hasData ? 'var(--color-border)' : over ? 'var(--color-error)' : 'var(--color-primary)',
                    borderRadius: '6px', opacity: !d.hasData ? 0.4 : 1,
                  }} />
                  {d.burned > 0 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 700 }}>🔥{d.burned}</span>
                  )}
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{d.letter}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{d.num}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bottom-spacer" />
    </main>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card" style={{ padding: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-secondary)', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  )
}
