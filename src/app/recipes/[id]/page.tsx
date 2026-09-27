import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Users, Flame } from 'lucide-react'
import AddRecipeButton from '../AddButton'
import { findRecipe } from '@/lib/recipes'

export default async function RecipeDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const found = findRecipe(id)
  if (!found) notFound()
  const { section, recipe: r } = found

  return (
    <main className="screen-container">
      <Link href="/recipes" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>
        <ArrowLeft size={18} /> Recetas
      </Link>

      <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
        {section.emoji} {r.name}
      </h1>
      <p className="subtitle" style={{ fontSize: '1rem' }}>
        {section.label} · {r.tag}
      </p>

      <div className="card" style={{ display: 'flex', gap: '0.5rem' }}>
        <Meta icon={<Clock size={16} color="var(--color-primary)" />} top={r.time} bottom="Tiempo" />
        <Meta icon={<Flame size={16} color="var(--color-primary)" />} top={`${r.kcal}`} bottom="kcal" />
        <Meta icon={<Users size={16} color="var(--color-primary)" />} top={r.servings} bottom="Rinde" />
      </div>

      <div className="card">
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          P {r.protein}g · C {r.carbs}g · G {r.fats}g
        </div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.6rem' }}>Ingredientes</h2>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
          {r.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.6rem' }}>Preparación</h2>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.1rem', fontSize: '0.9rem' }}>
          {r.steps.map((step, i) => (
            <li key={i} style={{ paddingLeft: '0.25rem' }}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>{r.kcal} kcal por porción</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Se suma al {section.label.toLowerCase()} de hoy</div>
        </div>
        <AddRecipeButton
          mealType={section.mealType}
          name={r.name}
          calories={r.kcal}
          protein={r.protein}
          carbs={r.carbs}
          fats={r.fats}
        />
      </div>

      <div className="bottom-spacer" />
    </main>
  )
}

function Meta({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', backgroundColor: 'var(--color-bg)', borderRadius: '12px', padding: '0.6rem 0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{top}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{bottom}</div>
    </div>
  )
}
