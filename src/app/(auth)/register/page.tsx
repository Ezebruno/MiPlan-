'use client'

import { useActionState, useEffect } from 'react'
import { registerAction } from './actions'
import Link from 'next/link'
import { User, Mail, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <main className="screen-container" style={{ justifyContent: 'center' }}>
      <div className="card shadow-lg" autoFocus>
        <h1 className="title" style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Crear cuenta</h1>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>Construí un plan para vos</p>

        {state?.error && (
          <div style={{ color: 'var(--color-error)', backgroundColor: '#FDECEC', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              name="name" 
              placeholder="Tu nombre" 
              required 
              className="input-field" 
              style={{ paddingLeft: '3rem' }} 
            />
          </div>
          
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
            {isPending ? 'Creando cuenta...' : 'Comenzar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
          ¿Ya tenés una cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
