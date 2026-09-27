'use client'

import { Suspense, useState, useEffect, useTransition } from 'react'
import { searchFoods, getPopularFoods, logFood } from './actions'
import { ArrowLeft, Search, Plus, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { todayStr } from '@/lib/dates'

export default function AddFoodPage() {
  return (
    <Suspense fallback={<main className="screen-container"><p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p></main>}>
      <AddFoodContent />
    </Suspense>
  )
}

function AddFoodContent() {
  const router = useRouter()
  const params = useSearchParams()
  const mealType = params.get('meal') || 'lunch'
  const dayParam = params.get('date')
  const entryDate = /^(\d{4})-(\d{2})-(\d{2})$/.test(dayParam ?? '') ? dayParam! : todayStr()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [qty, setQty] = useState(100)
  const [portions, setPortions] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState<string | null>(null)

  useEffect(() => {
    getPopularFoods().then(setResults)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      if (query === '') getPopularFoods().then(setResults)
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      const res = await searchFoods(query)
      setResults(res)
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [query])

  // Extraer gramos del servingSize ("1 feta (30g)" → 30, "100g" → 100, "1 taza (200ml)" → 200)
  const parseServingGrams = (servingSize: string | null): number => {
    if (!servingSize) return 100
    const m30g = servingSize.match(/(\d+)\s*g(?:\s|\)|$)/i)
    if (m30g) return Number(m30g[1])
    const m200ml = servingSize.match(/(\d+)\s*ml/i)
    if (m200ml) return Number(m200ml[1])
    const m100 = servingSize.match(/(\d+)\s*(?:porción|unidad|feta|taza|rodaja|tallo|lata|cucharada|cucharadita|sobre|barrita|botellita|chorizo|milanesa|choclo|tajada|rodaja|galletita|puñado)/i)
    if (m100) return Number(m100[1])
    return 100
  }

  const servingGrams = selected ? parseServingGrams(selected.servingSize) : 100
  const totalGrams = qty * portions
  const scaled = (val: number) => Math.round((val * totalGrams) / servingGrams)

  const handleAdd = () => {
    if (!selected) return
    const name = selected.name
    startTransition(async () => {
      await logFood({
        date: entryDate,
        mealType,
        foodName: selected.name,
        quantity: totalGrams,
        calories: scaled(selected.calories),
        protein: Math.round(selected.protein * totalGrams / servingGrams),
        carbs: Math.round(selected.carbs * totalGrams / servingGrams),
        fats: Math.round(selected.fat * totalGrams / servingGrams),
      })
      setAdded(name)
      setSelected(null)
      setPortions(1)
      setTimeout(() => setAdded(null), 2500)
    })
  }

  const mealLabel: Record<string, string> = {
    breakfast: 'Desayuno', lunch: 'Almuerzo', snack: 'Merienda', dinner: 'Cena', other: 'Otro'
  }

  return (
    <main className="screen-container" style={{ paddingTop: 0 }}>
      {/* Header + buscador fijos */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, backgroundColor: 'var(--color-bg)', paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button onClick={() => router.back()} style={{ padding: '0.5rem' }}><ArrowLeft size={24} /></button>
          <div>
            <h1 className="title" style={{ fontSize: '1.25rem', margin: 0 }}>Agregar Alimento</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>{mealLabel[mealType] || mealType}</p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar... ej. Banana, Huevo, Pollo"
            className="input-field" style={{ paddingLeft: '3rem' }}
            autoFocus
          />
        </div>
      </div>

      <div style={{ paddingTop: '0.75rem' }} />

      {/* Confirmación: sigue en el buscador para agregar más */}
      {added && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <Check size={18} />
          <span style={{ flex: 1 }}>{added} agregado al {mealLabel[mealType]}</span>
          <button onClick={() => router.push(`/dashboard?date=${entryDate}`)} style={{ fontWeight: 700, textDecoration: 'underline', color: 'var(--color-primary)' }}>
            Ver mi día
          </button>
        </div>
      )}

      {/* Results */}
      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Buscando...</div>}
      {!loading && results.length === 0 && query.length >= 2 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Sin resultados para "{query}"</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {results.map(food => (
          <button key={food.id} onClick={() => { setSelected(food); setQty(parseServingGrams(food.servingSize)); setPortions(1) }} 
            style={{
              width: '100%', padding: '1rem', borderRadius: '12px', textAlign: 'left', border: '1px solid var(--color-border)',
              backgroundColor: selected?.id === food.id ? 'var(--color-secondary)' : 'var(--color-bg-card)',
              borderColor: selected?.id === food.id ? 'var(--color-primary)' : 'var(--color-border)',
            }}>
            <div style={{ fontWeight: 600 }}>{food.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{food.servingSize} · {food.brand}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{food.calories} kcal</span>
              <span style={{ color: 'var(--color-text-muted)' }}> · P {food.protein}g · C {food.carbs}g · G {food.fat}g </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quantity Sheet */}
      {selected && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '480px',
          backgroundColor: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)',
          padding: '1.25rem 1.5rem', boxShadow: '0 -8px 24px rgba(0,0,0,0.1)',
          borderRadius: '24px 24px 0 0',
          zIndex: 100
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{selected.name}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Ajustá porciones y gramos</p>

          {/* Portions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', backgroundColor: 'var(--color-bg)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Porciones</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => setPortions(p => Math.max(1, p - 1))} className="btn-secondary" style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, fontWeight: 700, fontSize: '1.1rem' }}>−</button>
              <span style={{ fontWeight: 700, fontSize: '1.125rem', minWidth: '24px', textAlign: 'center' }}>{portions}</span>
              <button onClick={() => setPortions(p => p + 1)} className="btn-secondary" style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, fontWeight: 700, fontSize: '1.1rem' }}>+</button>
            </div>
          </div>

          {/* Grams per portion */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={() => setQty(q => Math.max(5, q - 10))} className="btn-secondary" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, fontWeight: 700, fontSize: '1.25rem' }}>−</button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <input
                type="number" value={qty} onChange={e => setQty(Number(e.target.value))}
                className="input-field" style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.25rem', width: '100%' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>gramos por porción</div>
            </div>
            <button onClick={() => setQty(q => q + 10)} className="btn-secondary" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0, fontWeight: 700, fontSize: '1.25rem' }}>+</button>
          </div>

          {portions > 1 && (
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Total: {totalGrams}g ({portions} × {qty}g)
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', backgroundColor: 'var(--color-bg)', padding: '0.75rem', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.25rem' }}>{scaled(selected.calories)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>kcal</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{Math.round(selected.protein * totalGrams / servingGrams)}g</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Proteína</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{Math.round(selected.carbs * totalGrams / servingGrams)}g</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Carbos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{Math.round(selected.fat * totalGrams / servingGrams)}g</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Grasas</div>
            </div>
          </div>

          <button onClick={handleAdd} className="btn-primary" disabled={isPending}>
            {isPending ? 'Guardando...' : <><Plus size={20} /> Agregar al {mealLabel[mealType]}</>}
          </button>
        </div>
      )}
      <div style={{ height: selected ? '260px' : '0' }} />
    </main>
  )
}
