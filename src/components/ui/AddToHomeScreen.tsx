'use client'

import { useEffect, useState } from 'react'

export function AddToHomeScreen() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('addToHomeScreenDismissed')) {
      setDismissed(true)
      return
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    // Detect Android
    const isAndroidDevice = /Android/.test(navigator.userAgent)

    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)

    // Show prompt after 3 seconds if not dismissed and not installed
    const timer = setTimeout(() => {
      if ((isIOSDevice || isAndroidDevice) && !localStorage.getItem('addToHomeScreenDismissed')) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('addToHomeScreenDismissed', 'true')
    setDismissed(true)
    setShowPrompt(false)
  }

  if (dismissed || !showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">Instalar App</h3>
              <p className="text-xs text-neutral-500">SPHERA TILE</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-neutral-400 hover:text-neutral-600 p-1"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        {isIOS && (
          <div className="text-sm text-neutral-700 space-y-2">
            <p>Para añadir esta app a tu pantalla de inicio:</p>
            <ol className="list-decimal list-inside space-y-1 text-neutral-600">
              <li>Toca el botón <strong>Compartir</strong> <svg className="inline-block w-4 h-4 mx-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> abajo</li>
              <li>Desliza hacia abajo y toca <strong>Añadir a inicio</strong></li>
            </ol>
          </div>
        )}

        {isAndroid && (
          <div className="text-sm text-neutral-700 space-y-2">
            <p>Para añadir esta app a tu pantalla de inicio:</p>
            <ol className="list-decimal list-inside space-y-1 text-neutral-600">
              <li>Toca el menú <strong>⋮</strong> de tu navegador</li>
              <li>Toca <strong>Añadir a pantalla de inicio</strong> o <strong>Instalar aplicación</strong></li>
            </ol>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="w-full mt-3 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}
