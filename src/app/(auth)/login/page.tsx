'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'
import Link from 'next/link'
import { Mail, Lock, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <main className="screen-container" style={{ justifyContent: 'center', position: 'relative' }}>
      <Link href="/" aria-label="Volver" style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <ArrowLeft size={20} />
      </Link>
      <div className="card shadow-lg">
        <h1 className="title" style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Hola de nuevo</h1>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>Iniciá sesión para continuar</p>

        {state?.error && (
          <div style={{ color: 'var(--color-error)', backgroundColor: '#FDECEC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="email" 
              name="email" 
              placeholder="Correo electrónico" 
              required 
              className="input-field" 
              style={{ paddingLeft: '3rem' }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="password" 
              name="password" 
              placeholder="Contraseña" 
              required 
              className="input-field" 
              style={{ paddingLeft: '3rem' }} 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={isPending}>
            {isPending ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
          ¿Aún no tenés cuenta?{' '}
          <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Registrate gratis
          </Link>
        </p>
      </div>
    </main>
  )
}
