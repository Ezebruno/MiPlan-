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

const NATIVE_FORMATS = [
  'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf', 'codabar', 'qr_code',
]

function ManualProductForm({ code, onSubmit }: { code: string; onSubmit: (p: ScannedProduct) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const str = (k: string) => fd.get(k)?.toString().trim() || ''
        const num = (k: string) => Number(fd.get(k)) || 0
        const grams = num('grams') || 100
        onSubmit({
          barcode: code,
          name: str('name') || `Producto ${code}`,
          brand: 'Manual',
          servingSize: `${str('portion') || '1 unidad'} (${grams}g)`,
          calories: num('kcal'),
          protein: num('protein'),
          carbs: num('carbs'),
          fat: num('fat'),
        })
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '480px', marginTop: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '0.9rem' }}
    >
      <input name="name" placeholder="Nombre del producto" required defaultValue="" style={manualInput} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input name="portion" placeholder="Porción (ej: 1 lata)" defaultValue="1 unidad" style={{ ...manualInput, flex: 1.2 }} />
        <input name="grams" type="number" min={1} placeholder="g" defaultValue={100} style={{ ...manualInput, flex: 1 }} />
        <input name="kcal" type="number" min={0} placeholder="kcal" required style={{ ...manualInput, flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input name="protein" type="number" min={0} step="any" placeholder="Prot g" style={{ ...manualInput, flex: 1 }} />
        <input name="carbs" type="number" min={0} step="any" placeholder="Carbos g" style={{ ...manualInput, flex: 1 }} />
        <input name="fat" type="number" min={0} step="any" placeholder="Grasa g" style={{ ...manualInput, flex: 1 }} />
      </div>
      <button type="submit" style={{ padding: '0.7rem', borderRadius: '12px', backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 800 }}>
        Guardar y continuar
      </button>
    </form>
  )
}

const manualInput: React.CSSProperties = {
  minWidth: 0,
  padding: '0.6rem 0.8rem',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.3)',
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '0.9rem',
}

export default function BarcodeScanner({
  onFound,
  onClose,
}: {
  onFound: (p: ScannedProduct) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handledRef = useRef(false)
  const doneRef = useRef(false)
  const onFoundRef = useRef(onFound)
  onFoundRef.current = onFound

  const [error, setError] = useState<string | null>(null)
  const [looking, setLooking] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [manualCode, setManualCode] = useState<string | null>(null)
  const [torch, setTorch] = useState(false)
  const [engine, setEngine] = useState<string>('iniciando…')
  const [videoSize, setVideoSize] = useState<string>('')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    let cancelled = false
    // Los refs persisten entre remontajes (StrictMode): resetear estado del ciclo anterior
    doneRef.current = false
    handledRef.current = false

    const cleanup = () => {
      doneRef.current = true
      if (timerRef.current) clearInterval(timerRef.current)
      try {
        readerRef.current?.reset()
      } catch { /* noop */ }
      streamRef.current?.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch { /* noop */ }
      })
      streamRef.current = null
    }

    const handleCode = async (code: string) => {
      if (handledRef.current || doneRef.current || !code) return
      handledRef.current = true
      setLooking(code)
      setManualCode(null)
      const product = await lookupBarcode(code)
      if (doneRef.current || cancelled) return
      if (product) {
        cleanup()
        onFoundRef.current(product)
      } else {
        // No está en Open Food Facts: se ofrece carga manual (el formulario queda visible)
        setLooking(null)
        setNotFound(true)
        setManualCode(code)
        handledRef.current = false
      }
    }

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        if (!cancelled && !doneRef.current) {
          setVideoSize(`${video.videoWidth}x${video.videoHeight}`)
        }

        // 1) Detector nativo (rápido, Android/Chrome) sobre recorte ampliado del recuadro
        const BD = (window as any).BarcodeDetector
        if (BD) {
          let detector: any = null
          try {
            detector = new BD({ formats: NATIVE_FORMATS })
          } catch {
            detector = new BD()
          }
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          setEngine('nativo')
          let tick = 0
          timerRef.current = setInterval(async () => {
            if (handledRef.current || doneRef.current || cancelled) return
            try {
              const vw = video.videoWidth
              const vh = video.videoHeight
              if (!vw || !vh || !ctx) return
              tick++
              setAttempts(tick)
              // Alterna recorte ampliado del recuadro y cuadro completo
              const full = tick % 3 === 0
              const rw = full ? vw : vw * 0.75
              const rh = full ? vh : vh * 0.34
              canvas.width = Math.round(rw * 2)
              canvas.height = Math.round(rh * 2)
              ctx.drawImage(video, (vw - rw) / 2, (vh - rh) / 2, rw, rh, 0, 0, canvas.width, canvas.height)
              const codes = await detector.detect(canvas)
              if (codes?.length) await handleCode(codes[0].rawValue)
            } catch { /* frame no legible */ }
          }, 500)
          return
        }

        // 2) Respaldo ZXing (iPhone y otros)
        setEngine('zxing')
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (cancelled || doneRef.current) return
        const reader = new BrowserMultiFormatReader()
        readerRef.current = reader
        await reader.decodeFromVideoDevice(undefined, video, (result: any) => {
          if (result) handleCode(result.getText())
        })
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
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTorch = async () => {
    try {
      const track = streamRef.current?.getVideoTracks()[0]
      await track?.applyConstraints({ advanced: [{ torch: !torch } as any] })
      setTorch(!torch)
    } catch { /* sin linterna */ }
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

      <div style={{ width: '100%', maxWidth: '480px', borderRadius: '16px', overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
        <video ref={videoRef} playsInline muted style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: '75%', height: '34%', border: '3px solid rgba(255,255,255,0.85)', borderRadius: '12px' }} />
        </div>
      </div>

      {looking && (
        <div style={{ color: '#fff', marginTop: '1rem', fontWeight: 600 }}>Buscando {looking}…</div>
      )}
      {!looking && !notFound && !error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'inline-block' }} />
          Buscando código en la cámara…
        </div>
      )}
      {notFound && (
        <div style={{ color: '#FFB4B0', marginTop: '1rem', fontWeight: 600, textAlign: 'center' }}>
          Producto no encontrado en la base. Cargalo manual:
        </div>
      )}
      {manualCode && (
        <ManualProductForm
          code={manualCode}
          onSubmit={onFound}
        />
      )}
      {error && (
        <div style={{ color: '#FFB4B0', marginTop: '1rem', fontWeight: 600, textAlign: 'center', maxWidth: '480px' }}>
          {error}
        </div>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const code = new FormData(e.currentTarget).get('code')?.toString().trim()
          if (!code || handledRef.current) return
          handledRef.current = true
          setLooking(code)
          setNotFound(false)
          const product = await lookupBarcode(code)
          if (product) {
            onFound(product)
          } else {
            setLooking(null)
            setNotFound(true)
            handledRef.current = false
            setTimeout(() => setNotFound(false), 3000)
          }
        }}
        style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '480px', marginTop: '1rem' }}
      >
        <input
          name="code"
          inputMode="numeric"
          placeholder="o escribí el código"
          style={{ flex: 1, minWidth: 0, padding: '0.6rem 0.9rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem' }}
        />
        <button type="submit" style={{ padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
          Buscar
        </button>
      </form>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
        Datos de Open Food Facts · La cámara necesita HTTPS o localhost
        <div style={{ marginTop: '0.25rem', opacity: 0.7 }}>
          motor: {engine}{videoSize ? ` · video ${videoSize}` : ''}{attempts > 0 ? ` · intentos ${attempts}` : ''}
        </div>
      </div>
    </div>
  )
}
