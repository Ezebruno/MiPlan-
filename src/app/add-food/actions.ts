'use server'

import { db, pool } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function searchFoods(query: string) {
  if (!query || query.length < 2) return []
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2)
  if (words.length === 0) return []
  // Estricto: solo nombres que EMPIEZAN con lo buscado.
  // "pan" → Pan integral; no Empanadas, ni Budín de pan, ni marcas como Panadería.
  const esc = (w: string) => w.replace(/'/g, "''").replace(/[%_\\]/g, '\\$&')
  const conditions = words.map(w => `(unaccent(lower(f."name")) LIKE '${esc(w)}%' ESCAPE '\\')`)
  const where = conditions.join(' AND ')
  const { rows } = await pool.query(
    `SELECT f.* FROM "Food" f WHERE ${where} ORDER BY f."name" LIMIT 25`
  )
  return rows
}

export async function getPopularFoods() {
  return await db.food.findMany({ take: 12, orderBy: { name: 'asc' } })
}

export async function getFoodsByNames(names: string[]) {
  if (names.length === 0) return []
  const foods = await db.food.findMany({ where: { name: { in: names } } })
  const order = new Map(names.map((n, i) => [n, i]))
  return foods.sort((a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99))
}

// Los más registrados por todos (se usa como "favoritos"/frecuentes)
export async function getFavoriteFoods(limit = 8) {
  const top: { foodName: string }[] = await db.$queryRaw`
    SELECT mi."foodName" AS "foodName"
    FROM "MealItem" mi
    GROUP BY mi."foodName"
    ORDER BY COUNT(*) DESC
    LIMIT ${limit}
  `
  if (top.length === 0) return await getPopularFoods()
  const names = top.map((t) => t.foodName)
  const foods = await db.food.findMany({ where: { name: { in: names } } })
  const byName = new Map(foods.map((f) => [f.name, f]))
  return names.flatMap((n) => (byName.get(n) ? [byName.get(n)!] : []))
}

export async function findFoodByBarcode(barcode: string) {
  const code = barcode.trim()
  if (!code) return null
  return await db.food.findUnique({ where: { barcode: code } })
}

export async function saveScannedFood(data: {
  barcode: string
  name: string
  brand?: string
  servingSize: string
  calories: number
  protein: number
  carbs: number
  fats: number
}) {
  const code = data.barcode.trim()
  if (!code) return null
  return await db.food.upsert({
    where: { barcode: code },
    update: {
      name: data.name,
      brand: data.brand ?? 'Escaneado',
      servingSize: data.servingSize,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fats,
    },
    create: {
      barcode: code,
      name: data.name,
      brand: data.brand ?? 'Escaneado',
      servingSize: data.servingSize,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fats,
    },
  })
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

  // Invalida el caché del dashboard para que al volver se vean los datos frescos
  revalidatePath('/dashboard', 'page')
}
