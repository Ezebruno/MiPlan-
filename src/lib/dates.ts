// Helpers de fecha local (YYYY-MM-DD). Evita los desfases de toISOString/new Date(str) que usan UTC.

export function toDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function parseLocalDate(s?: string | null): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '')
  if (!m) {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0, 0)
  if (isNaN(dt.getTime())) {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }
  return dt
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

export function formatLong(d: Date): string {
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
