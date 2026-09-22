'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ONBOARDING_GOALS, ONBOARDING_QUESTIONS, COMMON_QUESTIONS } from '@/lib/constants'
import { calculateMacroTargets, estimateWeeks, projectWeight } from '@/lib/calculations'
import { finishOnboarding } from './actions'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<any>({
    gender: 'female',
    age: 30,
    heightCm: 165,
    currentWeight: 65,
    activityLevel: 'sedentary',
    goal: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Configuración de flujo
  const dynamicQuestions = answers.goal ? ONBOARDING_QUESTIONS[answers.goal] || [] : []
  
  // Array de componentes/pantallas a renderizar
  const screens = useMemo(() => [
    { id: 'gender_age', title: 'Contanos sobre vos' },
    { id: 'height_weight', title: 'Tus medidas actuales' },
    { id: 'activity', title: 'Nivel de actividad' },
    { id: 'goal', title: '¿Cuál es tu objetivo?' },
    ...dynamicQuestions.map((q: any) => ({ ...q, isDynamic: true })),
    { ...COMMON_QUESTIONS.secondary_goals, isCommon: true },
    { ...COMMON_QUESTIONS.motivation, isCommon: true },
    { ...COMMON_QUESTIONS.review_date, isCommon: true },
    { id: 'target_weight', title: 'Peso objetivo (Opcional)' },
    { id: 'results', title: 'Tu plan está listo' }
  ], [dynamicQuestions])

  const currentScreen: any = screens[step]
  const progress = Math.round((step / (screens.length - 1)) * 100)

  const handleNext = async () => {
    if (step === screens.length - 2) {
      setIsSubmitting(true)
      try {
        await finishOnboarding(answers)
      } catch (e: any) {
        setIsSubmitting(false)
        console.error(e)
      }
    } else {
      setStep(s => Math.min(s + 1, screens.length - 1))
    }
  }

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 0))
  }

  const handleInput = (key: string, value: any) => {
    setAnswers({ ...answers, [key]: value })
  }

  const handleMultipleChoice = (key: string, value: any, isMultiple: boolean) => {
    if (isMultiple) {
      const current = answers[key] || []
      const updated = current.includes(value)
        ? current.filter((v: any) => v !== value)
        : [...current, value]
      setAnswers({ ...answers, [key]: updated })
    } else {
      // Sin avance automático: siempre se avanza con el botón Continuar
      setAnswers({ ...answers, [key]: value })
    }
  }

  // Renderizados por tipo
  const renderGenderAge = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Sexo biológico</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['female', 'male'].map((g) => (
            <button
              key={g}
              onClick={() => handleInput('gender', g)}
              style={{
                flex: 1, padding: '1rem', borderRadius: '12px',
                border: `2px solid ${answers.gender === g ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: answers.gender === g ? 'var(--color-secondary)' : 'var(--color-bg-card)',
                fontWeight: 600
              }}
            >
              {g === 'female' ? 'Mujer' : 'Hombre'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Edad</label>
        <input 
          type="number" className="input-field"
          value={answers.age} onChange={(e) => handleInput('age', e.target.value)}
        />
      </div>
    </div>
  )

  const renderHeightWeight = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Altura (cm)</label>
        <input 
          type="number" className="input-field"
          value={answers.heightCm} onChange={(e) => handleInput('heightCm', e.target.value)}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Peso actual (kg)</label>
        <input 
          type="number" step="0.1" className="input-field"
          value={answers.currentWeight} onChange={(e) => handleInput('currentWeight', e.target.value)}
        />
      </div>
    </div>
  )

  const renderActivity = () => {
    const activities = [
      { id: 'sedentary', label: 'Sedentario', desc: 'Trabajo sentado, poco movimiento' },
      { id: 'light', label: 'Ligero', desc: 'Camino bastante durante el día' },
      { id: 'moderate', label: 'Moderado', desc: 'Ejercicio 3-5 días por semana' },
      { id: 'active', label: 'Activo', desc: 'Ejercicio 6-7 días o trabajo físico' },
      { id: 'very_active', label: 'Muy activo', desc: 'Atleta o entrenamientos intensos diarios' }
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {activities.map(act => (
          <button
            key={act.id}
            onClick={() => handleInput('activityLevel', act.id)}
            style={{
              width: '100%', padding: '1rem', borderRadius: '12px', textAlign: 'left',
              border: `2px solid ${answers.activityLevel === act.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: answers.activityLevel === act.id ? 'var(--color-secondary)' : 'var(--color-bg-card)',
            }}
          >
            <div style={{ fontWeight: 600 }}>{act.label}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{act.desc}</div>
          </button>
        ))}
      </div>
    )
  }

  const renderGoal = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {ONBOARDING_GOALS.map(goal => (
        <button
          key={goal.id}
          onClick={() => {
            handleInput('goal', goal.id)
          }}
          style={{
            width: '100%', padding: '1.25rem 1rem', borderRadius: '12px', textAlign: 'left',
            border: `2px solid ${answers.goal === goal.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
            backgroundColor: answers.goal === goal.id ? 'var(--color-secondary)' : 'var(--color-bg-card)',
            fontWeight: 600
          }}
        >
          {goal.label}
        </button>
      ))}
      {answers.goal === 'other' && (
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            Especificá tu objetivo (opcional)
          </label>
          <input
            type="text"
            className="input-field"
            value={answers.goal_otro || ''}
            onChange={(e) => handleInput('goal_otro', e.target.value)}
            placeholder="Ej. Prepararme para una carrera..."
          />
        </div>
      )}
    </div>
  )

  const renderQuestion = (screen: any) => {
    if (screen.type === 'multiple_choice') {
      const isMultiple = screen.multiple
      const hasOtroOption = screen.options.some((opt: string) => String(opt).toLowerCase() === 'otro')
      const otroSelected = isMultiple
        ? (answers[screen.id] || []).some((v: any) => String(v).toLowerCase() === 'otro')
        : String(answers[screen.id] || '').toLowerCase() === 'otro'
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {screen.options.map((opt: string) => {
            const isSelected = isMultiple ? (answers[screen.id] || []).includes(opt) : answers[screen.id] === opt
            return (
              <button
                key={opt}
                onClick={() => handleMultipleChoice(screen.id, opt, isMultiple)}
                style={{
                  width: '100%', padding: '1.25rem 1rem', borderRadius: '12px', textAlign: 'left',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'var(--color-secondary)' : 'var(--color-bg-card)',
                  fontWeight: 600
                }}
              >
                {opt}
              </button>
            )
          })}
          {hasOtroOption && otroSelected && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Especificá (opcional)
              </label>
              <input
                type="text"
                className="input-field"
                value={answers[`${screen.id}_otro`] || ''}
                onChange={(e) => handleInput(`${screen.id}_otro`, e.target.value)}
                placeholder="Ej. Natación, Yoga..."
              />
            </div>
          )}
        </div>
      )
    }
    
    if (screen.type === 'text') {
      return (
        <textarea
          className="input-field"
          style={{ minHeight: '120px' }}
          value={answers[screen.id] || ''}
          onChange={(e) => handleInput(screen.id, e.target.value)}
          placeholder="Escribe tu respuesta..."
        />
      )
    }

    // Default target weight
    if (screen.id === 'target_weight') {
      return (
        <div>
          <input 
            type="number" step="0.1" className="input-field"
            value={answers.targetWeight || answers.currentWeight} 
            onChange={(e) => handleInput('targetWeight', e.target.value)}
          />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            Las estimaciones son orientativas y no sustituyen el asesoramiento de un profesional de la salud.
          </p>
        </div>
      )
    }
  }

  const renderContent = () => {
    switch (currentScreen.id) {
      case 'gender_age': return renderGenderAge();
      case 'height_weight': return renderHeightWeight();
      case 'activity': return renderActivity();
      case 'goal': return renderGoal();
      default: return renderQuestion(currentScreen);
    }
  }

  if (currentScreen.id === 'results') {
    const w = parseFloat(answers.currentWeight) || 0
    const tw = parseFloat(answers.targetWeight) || undefined
    const preview = (() => {
      try {
        return calculateMacroTargets({
          weightKg: w || 65,
          heightCm: parseFloat(answers.heightCm) || 165,
          age: parseInt(answers.age, 10) || 30,
          gender: answers.gender || 'female',
          activityLevel: answers.activityLevel || 'sedentary',
          goal: answers.goal || 'healthy_eating',
        })
      } catch { return null }
    })()
    const weeks = tw ? estimateWeeks(w, tw) : null
    const points = projectWeight(w, tw ?? w, weeks)
    const pMin = Math.min(...points)
    const pMax = Math.max(...points)
    const range = Math.max(0.5, pMax - pMin)
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * 280 + 10
      const y = 110 - ((p - pMin) / range) * 85 - 8
      return `${x},${y}`
    }).join(' ')

    return (
      <main className="screen-container" style={{ justifyContent: 'center' }}>
        <div className="card shadow-lg" style={{ textAlign: 'center' }}>
          <h1 className="title">Tu plan está listo 🎉</h1>
          <p className="subtitle" style={{ fontSize: '1rem' }}>Analizamos tus respuestas para crear un plan personalizado.</p>

          <div style={{ backgroundColor: 'var(--color-secondary)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
              Objetivo: {ONBOARDING_GOALS.find(g => g.id === answers.goal)?.label || '—'}
            </h3>
            <p style={{ fontWeight: 600 }}>Peso actual: {answers.currentWeight} kg {tw ? `→ ${tw} kg` : ''}</p>
            {weeks !== null && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Estimación orientativa: ~{weeks} semanas a ritmo saludable (0.5 kg/sem).</p>}
          </div>

          {preview && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { label: 'Calorías', value: `${preview.calories}`, unit: 'kcal' },
                { label: 'Proteína', value: `${preview.protein}`, unit: 'g' },
                { label: 'Carbos', value: `${preview.carbs}`, unit: 'g' },
                { label: 'Grasas', value: `${preview.fats}`, unit: 'g' },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, backgroundColor: 'var(--color-bg)', borderRadius: '12px', padding: '0.75rem 0.25rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>{m.value}<span style={{ fontSize: '0.7rem' }}> {m.unit}</span></div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '16px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'left' }}>Proyección estimada</div>
            <svg viewBox="0 0 300 125" style={{ width: '100%', height: '110px' }}>
              <polyline fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" points={coords} />
              {points.filter((_, i) => i % 3 === 0).map((p, j) => {
                const i = j * 3
                const x = (i / (points.length - 1)) * 280 + 10
                const y = 110 - ((p - pMin) / range) * 85 - 8
                return <circle key={j} cx={x} cy={y} r="4" fill="var(--color-primary)" />
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <span>Hoy · {w} kg</span>
              <span>Meta · {tw ?? w} kg</span>
            </div>
          </div>

          <div style={{ textAlign: 'left', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div>✅ Plan de calorías y macros diario</div>
            <div>✅ Registro de comidas, agua y peso</div>
            <div>✅ Seguimiento de progreso semanal</div>
          </div>

          <button onClick={() => handleNext()} className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Generando Dashboard...' : 'Ver mi plan'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="screen-container">
      {/* HEADER PROGRESS */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        {step > 0 && (
          <button onClick={handleBack} style={{ padding: '0.5rem', marginRight: '1rem' }}>
            <ArrowLeft size={24} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            Paso {step + 1} de {screens.length - 1}
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="card shadow-sm" style={{ flex: 1 }}>
        <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          {currentScreen.question || currentScreen.title}
        </h1>
        {renderContent()}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <button onClick={handleNext} className="btn-primary" disabled={currentScreen.id === 'goal' && !answers.goal}>
          Continuar
        </button>
      </div>
    </main>
  )
}
