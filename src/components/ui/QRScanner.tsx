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
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

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
      setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.')
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
        <div
          ref={containerRef}
          className="relative w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden"
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
          Apunta la cámara al código QR de un producto para ver sus detalles
        </p>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg max-w-xs">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
