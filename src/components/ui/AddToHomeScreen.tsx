'use client'

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'

export function AddToHomeScreen() {
  const [showModal, setShowModal] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showAutoPrompt, setShowAutoPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Check if already dismissed
    if (typeof window !== 'undefined' && localStorage.getItem('addToHomeScreenDismissed')) {
      setDismissed(true)
      return
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    // Detect Android
    const isAndroidDevice = /Android/.test(navigator.userAgent)

    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)

    // Show automatic prompt after 3 seconds
    const timer = setTimeout(() => {
      if ((isIOSDevice || isAndroidDevice) && !localStorage.getItem('addToHomeScreenDismissed')) {
        setShowAutoPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('addToHomeScreenDismissed', 'true')
    setDismissed(true)
    setShowAutoPrompt(false)
    setShowModal(false)
  }

  // Don't show anything if installed or desktop
  if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) return null
  if (typeof window !== 'undefined' && !/iPad|iPhone|iPod|Android/.test(navigator.userAgent)) return null

  return (
    <>
      {/* Automatic prompt (popup) */}
      {showAutoPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 p-4 animate-bounce-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">¡Instala la App!</h3>
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
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 font-medium">Para instalar en tu iPhone/iPad:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm text-neutral-600">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">1</div>
                    <p>Toca el botón <strong className="text-neutral-900">Compartir</strong> <svg className="inline w-5 h-5 mx-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-neutral-600">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">2</div>
                    <p>Desliza y toca <strong className="text-neutral-900">"Añadir a inicio"</strong></p>
                  </div>
                </div>
              </div>
            )}

            {isAndroid && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-700 font-medium">Para instalar en tu Android:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm text-neutral-600">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">1</div>
                    <p>Toca el menú <strong className="text-neutral-900">⋮</strong> de tu navegador</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-neutral-600">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">2</div>
                    <p>Toca <strong className="text-neutral-900">"Añadir a pantalla de inicio"</strong> o <strong className="text-neutral-900">"Instalar aplicación"</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="w-full mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Modal con instrucciones detalladas (triggered by icon) */}
      {showModal && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 animate-fade-in"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Instalar App</h3>
                  <p className="text-sm text-neutral-500">SPHERA TILE</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Visual instructions */}
            {isIOS && (
              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-neutral-900 mb-3">📱 iPhone / iPad</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700">Toca el botón <strong className="text-primary-600">Compartir</strong></p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="px-3 py-1 bg-neutral-200 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700">Desliza hacia abajo</p>
                        <p className="text-sm text-neutral-500">y toca <strong className="text-primary-600">"Añadir a inicio"</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAndroid && (
              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-neutral-900 mb-3">🤖 Android</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700">Toca el menú <strong className="text-primary-600">⋮</strong></p>
                        <p className="text-xs text-neutral-500 mt-1">Tres puntos en el navegador</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700">Toca <strong className="text-primary-600">"Añadir a pantalla de inicio"</strong></p>
                        <p className="text-xs text-neutral-500 mt-1">O "Instalar aplicación"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowModal(false)
                handleDismiss()
              }}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl transition-all shadow-md"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* Info icon button - shown in bottom navigation */}
      <button
        onClick={() => setShowModal(true)}
        className="nav-item flex-1 py-2 group relative"
      >
        <div className="relative">
          <Info size={24} />
          {/* Dot indicator to show it has info */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-600 rounded-full group-hover:scale-125 transition-transform"></span>
        </div>
        <span className="text-xs mt-1 text-neutral-500 group-hover:text-primary-600 transition-colors">Info</span>
      </button>
    </>
  )
}
