'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { searchFoods, logFood } from '../add-food/actions'
import { todayStr } from '@/lib/dates'

interface Part {
  key: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  grams: number
}

function parseGrams(servingSize: string | null): number {
  if (!servingSize) return 100
  const m = servingSize.match(/(\d+)\s*g(?:\s|\)|$)/i)
  if (m) return Number(m[1])
  const ml = servingSize.match(/(\d+)\s*ml/i)
  if (ml) return Number(ml[1])
  return 100
}

const SLOTS = ['Base', 'Proteína', 'Guarnición']
const MEALS = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Almuerzo' },
  { id: 'snack', label: 'Merienda' },
  { id: 'dinner', label: 'Cena' },
]

function SlotPicker({ label, onPick }: { label: string; onPick: (f: any) => void }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

  const search = async (v: string) => {
    setQ(v)
    if (v.length < 2) {
      setRes([])
      return
    }
    setBusy(true)
    setRes(await searchFoods(v))
    setBusy(false)
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{label}</div>
      <input
        value={q}
        onChange={(e) => search(e.target.value)}
        placeholder={`Buscar ${label.toLowerCase()}… ej. arroz, pollo, ensalada`}
        className="input-field"
      />
      {busy && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Buscando…</div>}
      {res.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
          {res.slice(0, 5).map((f) => (
            <button
              key={f.id}
              onClick={() => {
                onPick(f)
                setQ('')
                setRes([])
              }}
              style={{ textAlign: 'left', padding: '0.6rem 0.8rem', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-card)', fontSize: '0.875rem' }}
            >
              <span style={{ fontWeight: 600 }}>{f.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}> · {Math.round(f.calories)} kcal</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlatoPage() {
  const router = useRouter()
  const [meal, setMeal] = useState('lunch')
  const [parts, setParts] = useState<Part[]>([])
  const [pending, start] = useTransition()

  const addPart = (f: any) => {
    const g = parseGrams(f.servingSize)
    setParts((p) => [...p, {
      key: `${f.id}-${Date.now()}`,
      name: f.name,
      calories: Math.round(f.calories),
      protein: Math.round(f.protein),
      carbs: Math.round(f.carbs),
      fat: Math.round(f.fat),
      grams: g,
    }])
  }

  const totals = parts.reduce(
    (s, p) => ({ kcal: s.kcal + p.calories, prot: s.prot + p.protein, carbs: s.carbs + p.carbs, fat: s.fat + p.fat }),
    { kcal: 0, prot: 0, carbs: 0, fat: 0 }
  )

  const save = () => {
    if (parts.length === 0) return
    start(async () => {
      const date = todayStr()
      for (const p of parts) {
        await logFood({
          date,
          mealType: meal,
          foodName: p.name,
          quantity: p.grams,
          calories: p.calories,
          protein: p.protein,
          carbs: p.carbs,
          fats: p.fat,
        })
      }
      router.push(`/dashboard?date=${date}`)
    })
  }

  return (
    <main className="screen-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/dashboard" style={{ padding: '0.5rem' }}><ArrowLeft size={24} /></Link>
        <div>
          <h1 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Armar plato</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>Base + proteína + guarnición, todo sumado de una.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {MEALS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMeal(m.id)}
            style={{
              flex: 1, padding: '0.6rem 0.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem',
              backgroundColor: meal === m.id ? 'var(--color-primary)' : 'var(--color-bg-card)',
              color: meal === m.id ? '#fff' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {SLOTS.map((s) => (
        <SlotPicker key={s} label={s} onPick={addPart} />
      ))}

      {parts.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tu plato</h2>
          {parts.map((p) => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.35rem 0' }}>
              <span style={{ flex: 1 }}><strong>{p.name}</strong> · {p.calories} kcal</span>
              <button onClick={() => setParts((x) => x.filter((y) => y.key !== p.key))} aria-label="Quitar" style={{ color: 'var(--color-error)', display: 'flex' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--color-bg)', fontWeight: 800, fontSize: '0.9rem' }}>
            <span>{totals.kcal} kcal</span>
            <span>P {totals.prot}g</span>
            <span>C {totals.carbs}g</span>
            <span>G {totals.fat}g</span>
          </div>
          <button onClick={save} className="btn-primary" disabled={pending} style={{ marginTop: '0.75rem' }}>
            {pending ? 'Guardando…' : <><Plus size={20} /> Agregar plato al diario</>}
          </button>
        </div>
      )}
      <div className="bottom-spacer" />
    </main>
  )
}
