import Link from 'next/link'

const RECIPES = [
  { id: '1', name: 'Bowl de pollo y quinoa', kcal: 450, protein: 38, time: '25 min', tag: 'Alto en proteína' },
  { id: '2', name: 'Ensalada de atún y huevo', kcal: 320, protein: 28, time: '15 min', tag: 'Rápida' },
  { id: '3', name: 'Avena proteica con banana', kcal: 380, protein: 22, time: '10 min', tag: 'Desayuno' },
  { id: '4', name: 'Salteado de tofu y verduras', kcal: 300, protein: 18, time: '20 min', tag: 'Veggie' },
  { id: '5', name: 'Omelette de claras y espinaca', kcal: 220, protein: 24, time: '12 min', tag: 'Light' },
]

export default function RecipesPage() {
  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Recetas</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>Ideas simples para tu plan (MVP).</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {RECIPES.map(r => (
          <div key={r.id} className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.tag} · {r.time} · {r.kcal} kcal · {r.protein}g prot.</div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>🥗</span>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>En Fase 2 las recetas serán interactivas y se sumarán al diario con un tap.</p>
      <Link href="/dashboard" className="btn-secondary" style={{ marginTop: '1rem' }}>Volver al inicio</Link>
      <div className="bottom-spacer" />
    </main>
  )
}
