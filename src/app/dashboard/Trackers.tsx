'use client'

import { useState, useTransition } from 'react'
import { Droplets, Dumbbell, Plus, Minus, X, Trash2 } from 'lucide-react'
import { EXERCISE_TYPES, getExercise, calcExerciseKcal } from '@/lib/exercises'
import { addWater, addExerciseLog, deleteExerciseLog, clearExerciseLogs } from './actions'

export function WaterTracker({ initialMl, dateStr }: { initialMl: number; dateStr: string }) {
  const [isPending, start] = useTransition()
  const glasses = Math.floor(initialMl / 250)
  const liters = (initialMl / 1000).toFixed(2)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Droplets size={20} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Agua del día</h2>
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {liters} L ({glasses} vasos)
        </span>
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
        <div style={{ width: `${Math.min(100, (initialMl / 2000) * 100)}%`, height: '100%', backgroundColor: '#4AA8DE', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          disabled={isPending}
          onClick={() => start(() => addWater(250, dateStr))}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.6rem', borderRadius: '12px', backgroundColor: 'var(--color-secondary)', fontWeight: 700, fontSize: '0.875rem' }}
        >
          <Plus size={16} /> 1 vaso (250ml)
        </button>
        {initialMl > 0 && (
          <button
            disabled={isPending}
            onClick={() => start(() => addWater(-250, dateStr))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 0.8rem', borderRadius: '12px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            aria-label="Quitar vaso"
          >
            <Minus size={16} />
          </button>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
        Objetivo: 2 L por día
      </div>
    </div>
  )
}

export interface ExerciseLogItem {
  id: string
  type: string
  minutes: number
  kcal: number
}

export function ExerciseTracker({ logs, dateStr, weightKg }: { logs: ExerciseLogItem[]; dateStr: string; weightKg: number }) {
  const [typeId, setTypeId] = useState('run')
  const [minutes, setMinutes] = useState('')
  const [isPending, start] = useTransition()
  const totalMin = logs.reduce((s, l) => s + l.minutes, 0)
  const totalKcal = logs.reduce((s, l) => s + l.kcal, 0)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  const label = totalMin === 0 ? 'Sin registrar' : hours > 0 ? `${hours}h ${mins}min` : `${mins} min`
  const selected = getExercise(typeId)
  const inputMin = Number(minutes)
  const previewKcal = inputMin > 0 ? calcExerciseKcal(selected.met, weightKg, inputMin) : 0

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Dumbbell size={20} color="var(--color-primary)" />
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Ejercicio del día</h2>
        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {totalMin > 0 ? `${label} · ~${totalKcal} kcal` : label}
        </span>
        {logs.length > 0 && (
          <button
            disabled={isPending}
            onClick={() => start(() => clearExerciseLogs(dateStr))}
            aria-label="Borrar ejercicio del día"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <form
        action={(fd) => {
          const t = String(fd.get('type') || typeId)
          const v = Number(fd.get('minutes'))
          if (!v || v <= 0) return
          setMinutes('')
          start(() => addExerciseLog(t, v, dateStr))
        }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <select
          name="type"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          style={{ flex: '1 1 100%', padding: '0.6rem 0.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.875rem', fontWeight: 600 }}
        >
          {EXERCISE_TYPES.map((e) => (
            <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>
          ))}
        </select>
        <input
          name="minutes"
          type="number"
          min={1}
          max={600}
          placeholder="Min"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          style={{ flex: '1 1 80px', minWidth: 0, padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}
        >
          <Plus size={16} /> Sumar
        </button>
      </form>
      {previewKcal > 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
          {selected.emoji} {selected.label} {inputMin} min ≈ {previewKcal} kcal
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {[15, 30, 60].map((m) => (
          <button
            key={m}
            disabled={isPending}
            onClick={() => start(() => addExerciseLog(typeId, m, dateStr))}
            style={{ flex: 1, padding: '0.4rem', borderRadius: '10px', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', fontSize: '0.8rem', fontWeight: 600 }}
          >
            +{m} min
          </button>
        ))}
      </div>
      {logs.length > 0 && (
        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {logs.map((l) => {
            const e = getExercise(l.type)
            return (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <span>{e.emoji}</span>
                <span style={{ fontWeight: 600 }}>{e.label}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{l.minutes} min · ~{l.kcal} kcal</span>
                <button
                  disabled={isPending}
                  onClick={() => start(() => deleteExerciseLog(l.id, dateStr))}
                  aria-label={`Quitar ${e.label}`}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '8px', background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
