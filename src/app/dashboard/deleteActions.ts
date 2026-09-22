'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function deleteMealItemDirect(itemId: string) {
  const session = await getSession()
  if (!session?.userId) return

  const item = await db.mealItem.findUnique({
    where: { id: itemId },
    include: { meal: true },
  })
  if (!item || item.meal.userId !== session.userId) return

  const date = item.meal.date
  await db.dailySummary.updateMany({
    where: { userId: session.userId, date },
    data: {
      totalCalories: { decrement: item.calories },
      totalProtein: { decrement: item.protein },
      totalCarbs: { decrement: item.carbs },
      totalFats: { decrement: item.fats },
    },
  })
  await db.mealItem.delete({ where: { id: itemId } })
  const remaining = await db.mealItem.count({ where: { mealId: item.mealId } })
  if (remaining === 0) await db.meal.delete({ where: { id: item.mealId } })
}

export async function deleteMealDirect(mealId: string) {
  const session = await getSession()
  if (!session?.userId) return

  const meal = await db.meal.findUnique({
    where: { id: mealId },
    include: { items: true },
  })
  if (!meal || meal.userId !== session.userId) return

  for (const item of meal.items) {
    await db.dailySummary.updateMany({
      where: { userId: session.userId, date: meal.date },
      data: {
        totalCalories: { decrement: item.calories },
        totalProtein: { decrement: item.protein },
        totalCarbs: { decrement: item.carbs },
        totalFats: { decrement: item.fats },
      },
    })
  }
  await db.mealItem.deleteMany({ where: { mealId } })
  await db.meal.delete({ where: { id: mealId } })
}
