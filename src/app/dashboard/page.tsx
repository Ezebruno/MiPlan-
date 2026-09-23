import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import DatePicker from './DatePicker'
import MealSection from './MealSection'
import { WaterTracker, ExerciseTracker } from './Trackers'
import MotivationalModal from './MotivationalModal'
import { parseLocalDate, toDateStr, addDays, formatLong, todayStr } from '@/lib/dates'

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Almuerzo' },
  { id: 'snack', label: 'Merienda' },
  { id: 'dinner', label: 'Cena' },
  { id: 'other', label: 'Otro' },
]

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')

  const { date: dateParam } = await searchParams
  const selectedDay = parseLocalDate(dateParam)
  const dateStr = toDateStr(selectedDay)
  const nextDay = addDays(selectedDay, 1)
  const isToday = dateStr === todayStr()

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      dailyStats: { where: { date: { gte: selectedDay, lt: nextDay } } },
      meals: {
        where: { date: { gte: selectedDay, lt: nextDay } },
        include: { items: true }
      },
      exerciseLogs: {
        where: { date: { gte: selectedDay, lt: nextDay } },
        orderBy: { createdAt: 'asc' },
      },
    }
  })

  if (!user || !user.profile) redirect('/onboarding')

  const profile = user.profile
  const todaySummary = user.dailyStats[0]

  const consumed = todaySummary?.totalCalories ?? 0
  const consumedProtein = todaySummary?.totalProtein ?? 0
  const consumedCarbs = todaySummary?.totalCarbs ?? 0
  const consumedFats = todaySummary?.totalFats ?? 0
  const waterMl = todaySummary?.waterMl ?? 0
  const legacyExerciseMin = (todaySummary as any)?.exerciseMin ?? 0

  const target = profile.targetCalories || 2000
  const weightKg = profile.currentWeight ?? 70
  // Quemadas = suma de logs del día (tipo + duración + peso); fallback a dato legacy
  const loggedKcal = user.exerciseLogs.reduce((s, l) => s + l.kcal, 0)
  const loggedMin = user.exerciseLogs.reduce((s, l) => s + l.minutes, 0)
  const burned = loggedKcal > 0 || loggedMin > 0
    ? loggedKcal
    : Math.round(legacyExerciseMin * weightKg * 0.1)
  // Estándar apps nutrición: el ejercicio se suma al presupuesto (eat-back).
  // Objetivo ajustado = base + quemadas; restantes = ajustado - consumidas.
  const adjusted = target + burned
  const remaining = Math.max(0, adjusted - consumed)
  const progressPercent = Math.min(100, adjusted > 0 ? Math.round((consumed / adjusted) * 100) : 0)

  const displayName = (user.name || 'Usuario').replace(/[0-9]/g, '').trim().split(' ')[0]

  const prevStr = toDateStr(addDays(selectedDay, -1))
  const nextStr = toDateStr(addDays(selectedDay, 1))

  return (
    <main className="screen-container">
      <MotivationalModal />
      <div style={{ marginBottom: '1rem' }}>
        <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Hola, {displayName} 👋</h1>
      </div>

      {/* SELECTOR DE DÍA / CALENDARIO */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}>
        <Link href={`/dashboard?date=${prevStr}`} aria-label="Día anterior"
          style={{ padding: '0.5rem', color: 'var(--color-primary)' }}>
          <ChevronLeft size={22} />
        </Link>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>
            {isToday ? 'Hoy' : formatLong(selectedDay)}
          </div>
          {isToday && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
              {formatLong(selectedDay)}
            </div>
          )}
          {!isToday && (
            <Link href="/dashboard" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Volver a hoy
            </Link>
          )}
        </div>
        <Link href={`/dashboard?date=${nextStr}`} aria-label="Día siguiente"
          style={{ padding: '0.5rem', color: 'var(--color-primary)' }}>
          <ChevronRight size={22} />
        </Link>
        <form action="/dashboard" method="get" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <DatePicker current={dateStr} />
        </form>
      </div>

      {/* RESUMEN CALORÍAS: Consumidas · Restantes · Quemadas */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{consumed}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Consumidas</div>
          </div>
          <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary)" strokeWidth="10"
                strokeDasharray="314" strokeDashoffset={314 - (314 * progressPercent) / 100}
                strokeLinecap="round" />
            </svg>
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{remaining}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Restantes</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{burned}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Quemadas</div>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
          {burned > 0
            ? `Base ${target} + ${burned} de ejercicio = ${adjusted} kcal`
            : `Objetivo: ${target} kcal`}
        </div>
      </div>

      {/* MACRONUTRIENTES */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Macronutrientes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MacroBar label="Proteínas" current={consumedProtein} total={profile.targetProtein ?? 140} color="#E85D75" />
          <MacroBar label="Carbohidratos" current={consumedCarbs} total={profile.targetCarbs ?? 250} color="#F2A65A" />
          <MacroBar label="Grasas" current={consumedFats} total={profile.targetFats ?? 70} color="#F9D46C" />
        </div>
      </div>

      {/* COMIDAS (4 por día) */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Comidas del {isToday ? 'día' : formatLong(selectedDay)}
        </h2>
        {MEAL_TYPES.map(({ id, label }) => (
          <MealSection key={id} id={id} label={label} meal={user.meals.find(m => m.mealType === id)} dateStr={dateStr} />
        ))}
      </div>

      {/* AGUA + EJERCICIO */}
      <WaterTracker initialMl={waterMl} dateStr={dateStr} />
      <ExerciseTracker logs={user.exerciseLogs} dateStr={dateStr} weightKg={weightKg} />

      <div className="bottom-spacer" />
    </main>
  )
}

function MacroBar({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
  const percent = Math.min(100, total > 0 ? (current / total) * 100 : 0)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        <span>{label}</span>
        <span>{current} / {total} g</span>
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}
