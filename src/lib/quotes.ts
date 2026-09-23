export const QUOTES = [
  'La disciplina de hoy es el resultado de mañana.',
  'No tenés que ser perfecto, solo constante.',
  'Cada comida es una oportunidad de cuidarte.',
  'El progreso lento también es progreso.',
  'Tu cuerpo puede hacerlo, tu mente tiene que creerlo.',
  'Empezá donde estás, usá lo que tenés.',
  'Los grandes cambios nacen de pequeños hábitos.',
  'Hoy es un buen día para superarte.',
  'Comé para nutrirte, movete para celebrarlo.',
  'La constancia supera a la motivación.',
  'Un paso a la vez, un día a la vez.',
  'Cuidarte no es un premio, es un hábito.',
  'Lo que hacés hoy construye tu mañana.',
  'Sé más fuerte que tus excusas.',
]

export function getQuoteOfDay(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000)
  return QUOTES[dayOfYear % QUOTES.length]
}
