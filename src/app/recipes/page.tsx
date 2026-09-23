import AddRecipeButton from './AddButton'

interface Recipe {
  id: string
  name: string
  kcal: number
  protein: number
  carbs: number
  fats: number
  time: string
  tag: string
}

const SECTIONS: { id: string; label: string; emoji: string; mealType: string; recipes: Recipe[] }[] = [
  {
    id: 'desayuno',
    label: 'Desayuno',
    emoji: '🌅',
    mealType: 'breakfast',
    recipes: [
      { id: 'd1', name: 'Avena proteica con banana', kcal: 380, protein: 22, carbs: 55, fats: 8, time: '10 min', tag: 'Energético' },
      { id: 'd2', name: 'Omelette de claras y espinaca', kcal: 220, protein: 24, carbs: 6, fats: 11, time: '12 min', tag: 'Light' },
      { id: 'd3', name: 'Yogur griego con granola y miel', kcal: 350, protein: 25, carbs: 45, fats: 8, time: '5 min', tag: 'Rápido' },
    ],
  },
  {
    id: 'almuerzo',
    label: 'Almuerzo',
    emoji: '☀️',
    mealType: 'lunch',
    recipes: [
      { id: 'a1', name: 'Bowl de pollo y quinoa', kcal: 450, protein: 38, carbs: 42, fats: 14, time: '25 min', tag: 'Alto en proteína' },
      { id: 'a2', name: 'Ensalada de atún y huevo', kcal: 320, protein: 28, carbs: 8, fats: 19, time: '15 min', tag: 'Rápida' },
      { id: 'a3', name: 'Pasta integral con pollo y brócoli', kcal: 520, protein: 40, carbs: 62, fats: 12, time: '30 min', tag: 'Completo' },
    ],
  },
  {
    id: 'merienda',
    label: 'Merienda',
    emoji: '🌤️',
    mealType: 'snack',
    recipes: [
      { id: 'm1', name: 'Tostadas integrales con palta y huevo', kcal: 340, protein: 16, carbs: 30, fats: 17, time: '15 min', tag: 'Clásico' },
      { id: 'm2', name: 'Smoothie de frutos rojos y proteína', kcal: 250, protein: 24, carbs: 34, fats: 2, time: '5 min', tag: 'Post-entreno' },
      { id: 'm3', name: 'Panqueques de avena y manzana', kcal: 310, protein: 12, carbs: 52, fats: 6, time: '20 min', tag: 'Dulce' },
    ],
  },
  {
    id: 'cena',
    label: 'Cena',
    emoji: '🌙',
    mealType: 'dinner',
    recipes: [
      { id: 'c1', name: 'Salteado de tofu y verduras', kcal: 300, protein: 18, carbs: 22, fats: 16, time: '20 min', tag: 'Veggie' },
      { id: 'c2', name: 'Merluza al horno con ensalada', kcal: 340, protein: 36, carbs: 10, fats: 17, time: '25 min', tag: 'Liviano' },
      { id: 'c3', name: 'Pechuga grillada con calabaza', kcal: 380, protein: 42, carbs: 22, fats: 14, time: '30 min', tag: 'Alto en proteína' },
    ],
  },
]

export default function RecipesPage() {
  return (
    <main className="screen-container">
      <h1 className="title" style={{ fontSize: '1.5rem' }}>Recetas</h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>Tocá Agregar para sumarlas a tu diario de hoy.</p>
      {SECTIONS.map((s) => (
        <div key={s.id} style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.6rem' }}>
            {s.emoji} {s.label}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {s.recipes.map((r) => (
              <div key={r.id} className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.tag} · {r.time} · {r.kcal} kcal · {r.protein}g prot.</div>
                  </div>
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
