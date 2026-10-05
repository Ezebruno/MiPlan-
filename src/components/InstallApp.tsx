'use client'

import { useEffect, useState } from 'react'
import { Download, Check, Share, MoreVertical } from 'lucide-react'

// Botón "instalar app": usa el prompt nativo cuando el navegador lo ofrece
// (Android/Chrome) y muestra instrucciones manuales en iOS u otros casos.
export default function InstallApp() {
  const [deferred, setDeferred] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    setInstalled(standalone)
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as any)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) {
      setShowHelp((v) => !v)
      return
    }
    try {
      deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setDeferred(null)
      else setShowHelp(true)
    } catch {
      setShowHelp(true)
    }
  }

  if (installed) {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-secondary)', flexShrink: 0 }}>
          <Check size={18} color="var(--color-primary)" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>App instalada</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>La estás usando desde tu inicio.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-secondary)', flexShrink: 0 }}>
          <Download size={18} color="var(--color-primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Instalar app</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Agregala al inicio de tu teléfono.</div>
        </div>
        <button onClick={install} className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
          Instalar
        </button>
      </div>
      {showHelp && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', backgroundColor: 'var(--color-bg)', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {isIos ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Share size={16} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <span>En Safari tocá <strong>Compartir</strong> y después <strong>Agregar a pantalla de inicio</strong>.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <MoreVertical size={16} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <span>En el menú del navegador (⋮) elegí <strong>Instalar app</strong> o <strong>Agregar a pantalla principal</strong>.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
