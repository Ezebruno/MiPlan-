// src/lib/calculations.ts

export type Gender = 'male' | 'female';
export type Goal = 'lose_weight' | 'healthy_eating' | 'gain_weight' | 'muscle_gain' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

interface UserParams {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface NutritionalTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Multiplicadores de AF
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Poco movimiento
  light: 1.375,   // Camino bastante o ej. ligero 1-3 dias
  moderate: 1.55, // 3-5 días
  active: 1.725,  // 6-7 días o trabajo físico
  very_active: 1.9 // Atletas, 2 veces al día
};

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  // Ecuación de Mifflin-St Jeor
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateMacroTargets(params: UserParams): NutritionalTargets {
  const bmr = calculateBMR(params.weightKg, params.heightCm, params.age, params.gender);
  const tdee = calculateTDEE(bmr, params.activityLevel);

  let targetCalories = tdee;

  // Ajustes de objetivo (Kcal)
  if (params.goal === 'lose_weight') {
    targetCalories = tdee - 500; // Déficit conservador
  } else if (params.goal === 'gain_weight') {
    targetCalories = tdee + 300; // Superávit para ganar peso
  } else if (params.goal === 'muscle_gain') {
    targetCalories = tdee + 250; // Superávit ligero
  }
  // healthy_eating and other se mantiene en mantenimiento por defecto.

  // Reglas límite de seguridad (no bajar de 1200 en mujer / 1500 en hombre salvo indicación médica)
  if (params.gender === 'female' && targetCalories < 1200) targetCalories = 1200;
  if (params.gender === 'male' && targetCalories < 1500) targetCalories = 1500;

  let proteinPerKg = 1.6;
  let fatPercentage = 0.25;

  // Ajustes de macros por objetivo
  if (params.goal === 'muscle_gain') {
    proteinPerKg = 2.0;
  } else if (params.goal === 'lose_weight') {
    proteinPerKg = 1.8; // Mayor saciedad y retención muscular
  }

  const proteinGrams = Math.round(params.weightKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  const fatCalories = targetCalories * fatPercentage;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbohidratos son el resto
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbsGrams = Math.max(0, Math.round(remainingCalories / 4));

  return {
    calories: Math.round(targetCalories),
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatGrams,
  };
}

// Estimación de semanas para llegar al peso objetivo (0.5 kg/semana aprox.)
export function estimateWeeks(currentWeight: number, targetWeight?: number): number | null {
  if (!targetWeight || isNaN(targetWeight)) return null;
  const diff = Math.abs(currentWeight - targetWeight);
  if (diff <= 0) return 0;
  return Math.max(1, Math.round(diff / 0.5));
}

// Proyección lineal de peso para graficar (12 puntos)
export function projectWeight(currentWeight: number, targetWeight: number | undefined, weeks: number | null): number[] {
  const end = targetWeight && !isNaN(targetWeight) ? targetWeight : currentWeight;
  const n = 12;
  const points: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    points.push(Math.round((currentWeight + (end - currentWeight) * t) * 10) / 10);
  }
  return points;
}
