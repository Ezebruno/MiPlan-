export interface ExerciseType {
  id: string
  label: string
  emoji: string
  met: number
}

// MET values (Compendium of Physical Activities, ritmo moderado)
export const EXERCISE_TYPES: ExerciseType[] = [
  { id: 'walk', label: 'Caminar', emoji: '🚶', met: 3.5 },
  { id: 'run', label: 'Correr', emoji: '🏃', met: 9.8 },
  { id: 'bike', label: 'Bicicleta', emoji: '🚴', met: 7.5 },
  { id: 'strength', label: 'Entrenamiento de fuerza', emoji: '🏋️', met: 6.0 },
  { id: 'hiit', label: 'HIIT', emoji: '🔥', met: 8.0 },
  { id: 'yoga', label: 'Yoga', emoji: '🧘', met: 3.0 },
  { id: 'swim', label: 'Natación', emoji: '🏊', met: 8.0 },
  { id: 'soccer', label: 'Fútbol', emoji: '⚽', met: 7.0 },
  { id: 'basket', label: 'Básquet', emoji: '🏀', met: 6.5 },
  { id: 'other', label: 'Otro', emoji: '➕', met: 5.0 },
]

export function getExercise(id: string): ExerciseType {
  return EXERCISE_TYPES.find((e) => e.id === id) ?? EXERCISE_TYPES[EXERCISE_TYPES.length - 1]
}

/** kcal = MET × peso(kg) × (minutos / 60) */
export function calcExerciseKcal(met: number, weightKg: number, minutes: number): number {
  if (!minutes || minutes <= 0) return 0
  return Math.round(met * weightKg * (minutes / 60))
}
