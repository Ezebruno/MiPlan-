import Link from 'next/link'
import AddRecipeButton from './AddButton'
import { RECIPE_SECTIONS } from '@/lib/recipes'

export default function RecipesPage() {
  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Recetas</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>Tocá una receta para ver cómo hacerla.</p>
      {RECIPE_SECTIONS.map((s) => (
        <div key={s.id} style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            {s.emoji} {s.label}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {s.recipes.map((r) => (
              <div key={r.id} className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <Link href={`/recipes/${r.id}`} style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.tag} · {r.time} · {r.kcal} kcal · {r.protein}g prot.</div>
                  </Link>
                  <AddRecipeButton
                    mealType={s.mealType}
                    name={r.name}
                    calories={r.kcal}
                    protein={r.protein}
                    carbs={r.carbs}
                    fats={r.fats}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="bottom-spacer" />
    </main>
  )
}
