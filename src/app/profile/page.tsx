import { getSession, logout } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Target, Flame, Beef, Ruler, Weight, Activity } from 'lucide-react'
import { calculateMacroTargets } from '@/lib/calculations'
import { ONBOARDING_GOALS } from '@/lib/constants'
import InstallApp from '@/components/InstallApp'

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentario',
  light: 'Ligero',
  moderate: 'Moderado',
  active: 'Activo',
  very_active: 'Muy activo',
}

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const user = await db.user.findUnique({
    where: { id: session.userId }, include: { profile: true },
  })
  if (!user) redirect('/login')
  const p = user.profile
  const goalLabel = ONBOARDING_GOALS.find((g) => g.id === p?.goal)?.label ?? p?.goal ?? '—'
  const activityLabel = (p?.activityLevel && ACTIVITY_LABELS[p.activityLevel]) ?? p?.activityLevel ?? '—'

  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Perfil</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>{user.name} · {user.email}</p>

      {p && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Tu plan actual</h2>
          <PlanRow icon={<Target size={18} color="var(--color-primary)" />} label="Objetivo" value={goalLabel} />
          <PlanRow icon={<Flame size={18} color="var(--color-primary)" />} label="Calorías" value={`${p.targetCalories ?? '—'} kcal`} />
          <PlanRow
            icon={<Beef size={18} color="var(--color-primary)" />}
            label="Macros"
            value={`P ${p.targetProtein ?? '—'}g · C ${p.targetCarbs ?? '—'}g · G ${p.targetFats ?? '—'}g`}
          />
          <PlanRow
            icon={<Ruler size={18} color="var(--color-primary)" />}
            label="Altura"
            value={p.heightCm ? `${p.heightCm} cm` : '—'}
          />
          <PlanRow
            icon={<Weight size={18} color="var(--color-primary)" />}
            label="Peso"
            value={p.currentWeight ? `${p.currentWeight} kg${p.targetWeight ? ` → meta ${p.targetWeight} kg` : ''}` : '—'}
            last={!p.activityLevel}
          />
          {p.activityLevel && (
            <PlanRow icon={<Activity size={18} color="var(--color-primary)" />} label="Actividad" value={activityLabel} last />
          )}
          <form action={recalculate} style={{ marginTop: '1rem' }}>
            <button className="btn-secondary" type="submit">Recalcular con mis datos</button>
          </form>
        </div>
      )}

      <InstallApp />

      <form action={signOut} style={{ marginTop: '1rem' }}>
        <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-error)', border: '1px solid var(--color-border)' }}>Cerrar sesión</button>
      </form>
      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1rem' }}>v0.1 MVP · MiPlan</p>
      <div className="bottom-spacer" />
    </main>
  )
}

function PlanRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.7rem 0', borderBottom: last ? 'none' : '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-secondary)', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

async function recalculate() {
  'use server'
  const { getSession } = await import('@/lib/auth')
  const { db } = await import('@/lib/db')
  const { redirect } = await import('next/navigation')
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const user = await db.user.findUnique({ where: { id: session.userId }, include: { profile: true } })
  const p = user?.profile
  if (!p || !p.currentWeight || !p.heightCm) redirect('/onboarding')
  const age = p!.birthDate ? new Date().getFullYear() - new Date(p!.birthDate).getFullYear() : 30
  const macros = calculateMacroTargets({
    weightKg: p!.currentWeight ?? 70, heightCm: p!.heightCm ?? 170, age,
    gender: (p!.gender as any) || 'female',
    activityLevel: (p!.activityLevel as any) || 'sedentary',
    goal: (p!.goal as any) || 'healthy_eating',
  })
  await db.profile.update({
    where: { userId: session.userId },
    data: { targetCalories: macros.calories, targetProtein: macros.protein, targetCarbs: macros.carbs, targetFats: macros.fats },
  })
  redirect('/dashboard')
}

async function signOut() {
  'use server'
  const { logout } = await import('@/lib/auth')
  const { redirect } = await import('next/navigation')
  await logout()
  redirect('/')
}
