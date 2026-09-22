import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import DatePicker from './DatePicker'
import MealSection from './MealSection'
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
      }
    }
  })

  if (!user || !user.profile) redirect('/onboarding')

  const profile = user.profile
  const todaySummary = user.dailyStats[0]

  const consumed = todaySummary?.totalCalories ?? 0
  const consumedProtein = todaySummary?.totalProtein ?? 0
  const consumedCarbs = todaySummary?.totalCarbs ?? 0
  const consumedFats = todaySummary?.totalFats ?? 0

  const target = profile.targetCalories || 2000
  const remaining = Math.max(0, target - consumed)
  const progressPercent = Math.min(100, Math.round((consumed / target) * 100))

  const displayName = (user.name || 'Usuario').replace(/[0-9]/g, '').trim().split(' ')[0]

  const prevStr = toDateStr(addDays(selectedDay, -1))
  const nextStr = toDateStr(addDays(selectedDay, 1))

  return (
    <main className="screen-container">
      <div style={{ marginBottom: '1rem' }}>
        <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Hola, {displayName} 👋</h1>
        <p className="subtitle" style={{ fontSize: '1rem', margin: 0 }}>Tu objetivo: {target} kcal diarias</p>
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

      {/* ANILLO DE CALORIAS */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-primary)" strokeWidth="10"
              strokeDasharray="314" strokeDashoffset={314 - (314 * progressPercent) / 100}
              strokeLinecap="round" />
          </svg>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{remaining}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>restantes</div>
          </div>
        </div>
        <div style={{ flex: 1, marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>OBJETIVO</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{target} kcal</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CONSUMIDAS</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{consumed} kcal</div>
          </div>
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
