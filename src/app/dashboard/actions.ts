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

import { getExercise } from '@/lib/exercises'

export async function addExerciseLog(type: string, minutes: number, dateStr?: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const mins = Math.round(Number(minutes))
  if (!mins || isNaN(mins) || mins <= 0 || mins > 1440) redirect(dateStr ? `/dashboard?date=${dateStr}` : '/dashboard')
  const date = dateStr ? parseLocalDate(dateStr) : todayStart()
  const profile = await db.profile.findUnique({ where: { userId: session.userId }, select: { currentWeight: true } })
  const weightKg = profile?.currentWeight ?? 70
  const kcal = Math.round(getExercise(type).met * weightKg * (mins / 60))
  await db.exerciseLog.create({
    data: { userId: session.userId, date, type: getExercise(type).id, minutes: mins, kcal },
  })
  redirect(dateStr ? `/dashboard?date=${dateStr}` : '/dashboard')
}

export async function deleteExerciseLog(id: string, dateStr?: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  await db.exerciseLog.deleteMany({ where: { id, userId: session.userId } })
  redirect(dateStr ? `/dashboard?date=${dateStr}` : '/dashboard')
}

export async function clearExerciseLogs(dateStr?: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const date = dateStr ? parseLocalDate(dateStr) : todayStart()
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  await db.exerciseLog.deleteMany({
    where: { userId: session.userId, date: { gte: date, lt: nextDay } },
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
