'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan?: (result: string) => void
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isScanning && hasInteracted) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen, hasInteracted])

  const requestCameraPermission = async () => {
    try {
      setError(null)
      console.log('📷 Solicitando permiso de cámara...')

      // Solicitar permiso explícitamente para Chrome móvil
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      console.log('✅ Permiso concedido, stream obtenido:', stream)

      // Detener el stream inmediatamente (solo queríamos el permiso)
      stream.getTracks().forEach(track => track.stop())

      // Ahora iniciar el escáner
      startScanning()
    } catch (err) {
      console.error('❌ Error requesting camera permission:', err)

      // Verificar el tipo de error para dar mensajes más específicos
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Permiso denegado. En Chrome: ajustes → Configuración del sitio → Permisos → Cámara.')
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró cámara. Verifica que tu dispositivo tenga cámara.')
        } else if (err.name === 'NotReadableError') {
          setError('La cámara está siendo usada por otra app. Cierra otras apps que usen la cámara.')
        } else {
          setError(`Error: ${err.message}`)
        }
      } else {
        setError('No se pudo acceder a la cámara. Error desconocido.')
      }

      console.log('🔍 Detalle del error:', err)
      setNeedsPermission(true)
    }
  }

  const startScanning = async () => {
    try {
      setError(null)
      setNeedsPermission(false)
      setIsScanning(true)

      // Verificar si estamos en HTTPS (requerido por Chrome móvil)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' &&
          window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('La cámara requiere HTTPS. Asegúrate de que el sitio usa una conexión segura.')
      }

      // Verificar soporte de getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara. Intenta con la última versión de Chrome o Firefox.')
      }

      // Verificar si la cámara está disponible
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(device => device.kind === 'videoinput')

      if (cameras.length === 0) {
        throw new Error('No se detecta ninguna cámara en tu dispositivo.')
      }

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText)
        },
        () => {
          // QR code not found in frame - this is normal
        }
      )
    } catch (err) {
      console.error('Error starting scanner:', err)
      const errorMessage = err instanceof Error ? err.message : 'No se pudo acceder a la cámara'

      // Mensajes específicos para Chrome
      if (errorMessage.includes('HTTPS')) {
        setError('Chrome requiere conexión HTTPS para acceder a la cámara.')
      } else if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        setError('Permiso denegado. Pulsa el botón para solicitar permiso.')
        setNeedsPermission(true)
      } else if (errorMessage.includes('Requested device not found')) {
        setError('Cámara no encontrada. Verifica que tu dispositivo tenga cámara disponible.')
      } else {
        setError(errorMessage)
        setNeedsPermission(true)
      }

      setIsScanning(false)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        // Ignore errors on stop
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = async (result: string) => {
    // Stop scanning first
    await stopScanning()

    // Check if it's a product URL from our site
    const productMatch = result.match(/\/productos\/([a-zA-Z0-9-]+)/)

    if (productMatch) {
      // Navigate to the product page
      router.push(`/productos/${productMatch[1]}`)
      onClose()
    } else if (result.startsWith('http')) {
      // External URL - open in new tab
      window.open(result, '_blank')
      onClose()
    } else if (onScan) {
      // Custom handler
      onScan(result)
      onClose()
    } else {
      setError('QR no reconocido. Escanea un código de producto de SPHERA TILE.')
      // Restart scanning after a delay
      setTimeout(() => {
        if (isOpen) startScanning()
      }, 2000)
    }
  }

  const handleClose = async () => {
    await stopScanning()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          <span className="font-medium">Escanear QR</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {!isScanning && !needsPermission && (
          <button
            onClick={() => {
              setHasInteracted(true)
              startScanning()
            }}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors mb-6"
          >
            📷 Iniciar Escáner
          </button>
        )}

        <div
          ref={containerRef}
          className={`relative w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden ${!isScanning && !needsPermission ? 'opacity-50' : ''}`}
        >
          <div id="qr-reader" className="w-full h-full" />

          {/* Overlay corners */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary-500 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary-500 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary-500 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary-500 rounded-br-2xl" />
          </div>
        </div>

        {/* Instructions */}
        <p className="text-white/70 text-center mt-6 text-sm max-w-xs">
          {isScanning ? 'Apunta la cámara al código QR' : 'Toca el botón para iniciar el escáner'}
        </p>

        {/* Error message */}
        {error && !isScanning && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-w-xs">
            <p className="text-red-300 text-sm text-center">{error}</p>
            <button
              onClick={requestCameraPermission}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors w-full"
            >
              📷 Solicitar Permiso
            </button>
          </div>
        )}

        {/* Botón para solicitar permisos manualmente (Chrome móvil) */}
        {needsPermission && !isScanning && (
          <button
            onClick={requestCameraPermission}
            className="mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            📷 Solicitar Permiso de Cámara
          </button>
        )}
      </div>
    </div>
  )
}
