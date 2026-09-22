'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { calculateMacroTargets } from '@/lib/calculations'

export async function finishOnboarding(answers: any) {
  const session = await getSession()
  if (!session?.userId) {
    throw new Error('No autorizado')
  }
  
  const currentWeightFloat = parseFloat(answers.currentWeight)
  const heightCmFloat = parseFloat(answers.heightCm)
  const ageInt = parseInt(answers.age, 10)
  
  if (isNaN(currentWeightFloat) || isNaN(heightCmFloat) || isNaN(ageInt)) {
    throw new Error('Faltan datos básicos para el cálculo')
  }
  
  // Calcular objetivos usando formula de lógica core
  const macros = calculateMacroTargets({
    weightKg: currentWeightFloat,
    heightCm: heightCmFloat,
    age: ageInt,
    gender: answers.gender,
    activityLevel: answers.activityLevel,
    goal: answers.goal
  })

  // Upsert profile for user
  const profile = await db.profile.upsert({
    where: { userId: session.userId },
    update: {
      birthDate: new Date(new Date().getFullYear() - ageInt, 0, 1),
      gender: answers.gender,
      heightCm: heightCmFloat,
      currentWeight: currentWeightFloat,
      targetWeight: parseFloat(answers.targetWeight) || null,
      goal: answers.goal,
      activityLevel: answers.activityLevel,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFats: macros.fats
    },
    create: {
      userId: session.userId,
      birthDate: new Date(new Date().getFullYear() - ageInt, 0, 1),
      gender: answers.gender,
      heightCm: heightCmFloat,
      currentWeight: currentWeightFloat,
      targetWeight: parseFloat(answers.targetWeight) || null,
      goal: answers.goal,
      activityLevel: answers.activityLevel,
      targetCalories: macros.calories,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFats: macros.fats
    }
  })

  redirect('/dashboard')
}
