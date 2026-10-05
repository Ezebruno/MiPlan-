'use server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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

async function copyItemsToDate(userId: string, fromDate: Date, toDate: Date, mealType?: string) {
  const nextDay = new Date(fromDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const sourceMeals = await db.meal.findMany({
    where: {
      userId,
      date: { gte: fromDate, lt: nextDay },
      ...(mealType ? { mealType } : {}),
    },
    include: { items: true },
  })
  let copied = 0
  for (const meal of sourceMeals) {
    if (meal.items.length === 0) continue
    let target = await db.meal.findFirst({ where: { userId, mealType: meal.mealType, date: toDate } })
    if (!target) {
      target = await db.meal.create({ data: { userId, date: toDate, mealType: meal.mealType } })
    }
    for (const item of meal.items) {
      await db.mealItem.create({
        data: {
          mealId: target.id,
          foodId: item.foodId,
          foodName: item.foodName,
          quantity: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
        },
      })
      copied++
    }
    const sums = meal.items.reduce(
      (s, i) => ({ kcal: s.kcal + i.calories, p: s.p + i.protein, c: s.c + i.carbs, f: s.f + i.fats }),
      { kcal: 0, p: 0, c: 0, f: 0 }
    )
    await db.dailySummary.upsert({
      where: { userId_date: { userId, date: toDate } },
      update: {
        totalCalories: { increment: sums.kcal },
        totalProtein: { increment: sums.p },
        totalCarbs: { increment: sums.c },
        totalFats: { increment: sums.f },
      },
      create: {
        userId,
        date: toDate,
        totalCalories: sums.kcal,
        totalProtein: sums.p,
        totalCarbs: sums.c,
        totalFats: sums.f,
      },
    })
  }
  return copied
}

// Repite una comida (o todo el día) de otra fecha en la fecha destino
export async function repeatMeal(fromDateStr: string, mealType: string, toDateStr: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const copied = await copyItemsToDate(session.userId, parseLocalDate(fromDateStr), parseLocalDate(toDateStr), mealType)
  revalidatePath('/dashboard')
  return copied
}

export async function repeatDay(fromDateStr: string, toDateStr: string) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const copied = await copyItemsToDate(session.userId, parseLocalDate(fromDateStr), parseLocalDate(toDateStr))
  revalidatePath('/dashboard')
  return copied
}
