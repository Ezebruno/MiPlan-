import { getSession, logout } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { calculateMacroTargets } from '@/lib/calculations'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const user = await db.user.findUnique({
    where: { id: session.userId }, include: { profile: true },
  })
  if (!user) redirect('/login')
  const p = user.profile

  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Perfil</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>{user.name} · {user.email}</p>

      {p && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Tu plan actual</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
            <div>🎯 Objetivo: <b>{p.goal}</b></div>
            <div>🔥 Calorías: <b>{p.targetCalories} kcal</b></div>
            <div>💪 Proteína: <b>{p.targetProtein}g</b> · 🍞 Carbos: <b>{p.targetCarbs}g</b> · 🥑 Grasas: <b>{p.targetFats}g</b></div>
            <div>📏 Altura: {p.heightCm} cm · ⚖️ Peso: {p.currentWeight} kg {p.targetWeight ? `→ ${p.targetWeight} kg` : ''}</div>
            <div>🏃 Actividad: {p.activityLevel}</div>
          </div>
          <form action={recalculate} style={{ marginTop: '1rem' }}>
            <button className="btn-secondary" type="submit">Recalcular con mis datos</button>
          </form>
        </div>
      )}

      <form action={signOut} style={{ marginTop: '1rem' }}>
        <button type="submit" className="btn-primary" style={{ backgroundColor: '#fff', color: 'var(--color-error)', border: '1px solid var(--color-border)' }}>Cerrar sesión</button>
      </form>
      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1rem' }}>v0.1 MVP · MiPlan</p>
      <div className="bottom-spacer" />
    </main>
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
