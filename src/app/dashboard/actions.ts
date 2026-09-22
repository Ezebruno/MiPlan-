'use server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { parseLocalDate, toDateStr } from '@/lib/dates'

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function addWater(ml: number, dateStr?: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const date = dateStr ? parseLocalDate(dateStr) : todayStart()
  await db.dailySummary.upsert({
    where: { userId_date: { userId: session.userId, date } },
    update: { waterMl: { increment: ml } },
    create: { userId: session.userId, date, waterMl: ml },
  })
  redirect(dateStr ? `/dashboard?date=${dateStr}` : '/dashboard')
}

export async function logWeight(weight: number, dateStr?: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const back = dateStr ? `/dashboard?date=${dateStr}` : '/dashboard'
  if (!weight || isNaN(weight) || weight <= 0) redirect(back)
  const date = todayStart()
  await db.weightLog.create({ data: { userId: session.userId, date, weight } })
  await db.profile.update({
    where: { userId: session.userId },
    data: { currentWeight: weight },
  })
  redirect(back)
}
