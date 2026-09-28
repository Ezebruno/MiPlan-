'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Zap, ZapOff } from 'lucide-react'

export interface ScannedProduct {
  barcode: string
  name: string
  brand: string
  servingSize: string
  calories: number // por 100g/ml
  protein: number
  carbs: number
  fat: number
  image?: string
}

async function lookupBarcode(barcode: string): Promise<ScannedProduct | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,quantity,nutriments,image_front_small_url`
  )
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 1 || !data.product) return null
  const p = data.product
  const n = p.nutriments ?? {}
  return {
    barcode,
    name: p.product_name || `Producto ${barcode}`,
    brand: p.brands || 'Escaneado',
    servingSize: p.quantity || '100g',
    calories: Math.round(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0),
    protein: Number(n.proteins_100g ?? n.proteins ?? 0),
    carbs: Number(n.carbohydrates_100g ?? n.carbohydrates ?? 0),
    fat: Number(n.fat_100g ?? n.fat ?? 0),
    image: p.image_front_small_url,
  }
}

export default function BarcodeScanner({
  onFound,
  onClose,
}: {
  onFound: (p: ScannedProduct) => void
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [looking, setLooking] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [torch, setTorch] = useState(false)
  const handledRef = useRef(false)
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5Qrcode('miplan-scanner')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 160 }, aspectRatio: 1 },
          async (code: string) => {
            if (handledRef.current) return
            handledRef.current = true
            setLooking(code)
            try {
              await scanner.pause(true)
            } catch { /* noop */ }
            const product = await lookupBarcode(code)
            if (cancelled) return
            if (product) {
              onFound(product)
            } else {
              try {
                await scanner.resume()
              } catch { /* noop */ }
              handledRef.current = false
              setNotFound(true)
              setLooking(null)
              setTimeout(() => !cancelled && setNotFound(false), 3000)
            }
          },
          () => { /* frame sin código, se ignora */ }
        )
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Habilitá la cámara para escanear.'
              : 'No se pudo abrir la cámara. Probá en HTTPS o localhost.'
          )
        }
      }
    })()
    return () => {
      cancelled = true
      scannerRef.current?.stop().catch(() => {})
      scannerRef.current?.clear().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTorch = async () => {
    try {
      const s = scannerRef.current
      if (!s) return
      const caps = s.getRunningTrackCapabilities?.()
      if (caps && 'torch' in caps) {
        await s.applyVideoConstraints({ advanced: [{ torch: !torch }] })
        setTorch(!torch)
      }
    } catch { /* noop */ }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, color: '#fff', fontWeight: 800 }}>Apuntá al código de barras</div>
        <button onClick={toggleTorch} aria-label="Linterna" style={{ color: '#fff', padding: '0.5rem', display: 'flex' }}>
          {torch ? <ZapOff size={22} /> : <Zap size={22} />}
        </button>
        <button onClick={onClose} aria-label="Cerrar escáner" style={{ color: '#fff', padding: '0.5rem', display: 'flex' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
        <div id="miplan-scanner" style={{ width: '100%' }} />
      </div>

      {looking && (
        <div style={{ color: '#fff', marginTop: '1rem', fontWeight: 600 }}>Buscando {looking}…</div>
      )}
      {notFound && (
        <div style={{ color: '#FFB4B0', marginTop: '1rem', fontWeight: 600, textAlign: 'center' }}>
          Producto no encontrado. Probá de nuevo u otro código.
        </div>
      )}
      {error && (
        <div style={{ color: '#FFB4B0', marginTop: '1rem', fontWeight: 600, textAlign: 'center', maxWidth: '480px' }}>
          {error}
        </div>
      )}
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
        Datos de Open Food Facts · La cámara necesita HTTPS o localhost
      </div>
    </div>
  )
}
