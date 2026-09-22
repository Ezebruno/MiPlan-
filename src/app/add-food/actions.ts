'use server'

import { db, pool } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function searchFoods(query: string) {
  if (!query || query.length < 2) return []
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2)
  if (words.length === 0) return []
  const conditions = words.map(w => `(unaccent(lower(f."name")) LIKE '%${w}%' OR unaccent(lower(f."brand")) LIKE '%${w}%')`)
  const where = conditions.join(' AND ')
  const { rows } = await pool.query(
    `SELECT f.* FROM "Food" f WHERE ${where} ORDER BY f."name" LIMIT 25`
  )
  return rows
}

export async function getPopularFoods() {
  return await db.food.findMany({ take: 12, orderBy: { name: 'asc' } })
}

export async function logFood(data: {
  date: string
  mealType: string
  foodId?: string
  foodName: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fats: number
}) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const userId = session.userId

  // Parsear YYYY-MM-DD como fecha local (new Date(str) lo toma como UTC y desplaza el día)
  const [y, m, d] = data.date.split('-').map(Number)
  const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0)
  const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999)

  let meal = await db.meal.findFirst({
    where: { userId, mealType: data.mealType, date: { gte: startOfDay, lte: endOfDay } }
  })

  if (!meal) {
    meal = await db.meal.create({
      data: { userId, date: startOfDay, mealType: data.mealType }
    })
  }

  await db.mealItem.create({
    data: {
      mealId: meal.id,
      foodName: data.foodName,
      quantity: data.quantity,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
    }
  })

  await db.dailySummary.upsert({
    where: { userId_date: { userId, date: startOfDay } },
    update: {
      totalCalories: { increment: data.calories },
      totalProtein: { increment: data.protein },
      totalCarbs: { increment: data.carbs },
      totalFats: { increment: data.fats },
    },
    create: {
      userId,
      date: startOfDay,
      totalCalories: data.calories,
      totalProtein: data.protein,
      totalCarbs: data.carbs,
      totalFats: data.fats,
    }
  })
}
