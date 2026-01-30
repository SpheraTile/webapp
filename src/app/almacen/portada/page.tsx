'use client'

import { useState, useEffect, useRef } from 'react'
import { IconPlus, IconX, IconCheck } from '@/components/ui/Icons'

interface HeroConfig {
  tipo: 'imagen' | 'video'
  url: string
}

export default function PortadaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [heroDesktop, setHeroDesktop] = useState<HeroConfig | null>(null)
  const [heroMobile, setHeroMobile] = useState<HeroConfig | null>(null)

  const desktopInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  // Cargar configuración actual
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [desktopRes, mobileRes] = await Promise.all([
          fetch('/api/configuracion?clave=hero_desktop'),
          fetch('/api/configuracion?clave=hero_mobile'),
        ])

        const desktopData = await desktopRes.json()
        const mobileData = await mobileRes.json()

        if (desktopData.valor) {
          setHeroDesktop(JSON.parse(desktopData.valor))
        }
        if (mobileData.valor) {
          setHeroMobile(JSON.parse(mobileData.valor))
        }
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Subir archivo
  const handleUpload = async (
    file: File,
    target: 'desktop' | 'mobile'
  ) => {
    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'portada')

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir archivo')
      }

      const config: HeroConfig = {
        tipo: data.type === 'video' ? 'video' : 'imagen',
        url: data.url,
      }

      if (target === 'desktop') {
        setHeroDesktop(config)
      } else {
        setHeroMobile(config)
      }

      setMessage({ type: 'success', text: `${data.type === 'video' ? 'Video' : 'Imagen'} subido correctamente` })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al subir archivo' })
    } finally {
      setUploading(false)
    }
  }

  // Guardar configuración
  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const promises = []

      if (heroDesktop) {
        promises.push(
          fetch('/api/configuracion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clave: 'hero_desktop',
              valor: JSON.stringify(heroDesktop),
              tipo: 'json',
              descripcion: 'Configuración del hero en desktop',
            }),
          })
        )
      }

      if (heroMobile) {
        promises.push(
          fetch('/api/configuracion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clave: 'hero_mobile',
              valor: JSON.stringify(heroMobile),
              tipo: 'json',
              descripcion: 'Configuración del hero en móvil',
            }),
          })
        )
      }

      await Promise.all(promises)
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar configuración' })
    } finally {
      setSaving(false)
    }
  }

  // Eliminar archivo
  const handleRemove = (target: 'desktop' | 'mobile') => {
    if (target === 'desktop') {
      setHeroDesktop(null)
      if (desktopInputRef.current) desktopInputRef.current.value = ''
    } else {
      setHeroMobile(null)
      if (mobileInputRef.current) mobileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Portada</h1>
        <p className="text-neutral-500 mt-1">Gestiona el video o imagen de la portada de la tienda</p>
      </div>

      {/* Mensajes */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Desktop */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Portada Desktop</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Recomendado: Video MP4 o imagen JPG/PNG. Resolución 1920x1080 o superior.
          </p>

          <input
            ref={desktopInputRef}
            type="file"
            accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file, 'desktop')
            }}
            className="hidden"
            id="desktop-upload"
          />

          {!heroDesktop ? (
            <label
              htmlFor="desktop-upload"
              className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              ) : (
                <>
                  <IconPlus size={32} className="text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-500">Subir video o imagen</span>
                  <span className="text-xs text-neutral-400 mt-1">MP4, WebM, JPG, PNG, WebP (máx. 100MB)</span>
                </>
              )}
            </label>
          ) : (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-100">
              {heroDesktop.tipo === 'video' ? (
                <video
                  src={heroDesktop.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={heroDesktop.url}
                  alt="Hero desktop"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                  {heroDesktop.tipo === 'video' ? 'Video' : 'Imagen'}
                </span>
                <span className="p-1.5 bg-green-500 rounded-full">
                  <IconCheck size={14} className="text-white" />
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove('desktop')}
                  className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <IconX size={14} className="text-white" />
                </button>
              </div>
            </div>
          )}

          {heroDesktop && (
            <p className="text-xs text-neutral-400 mt-2 truncate">
              URL: {heroDesktop.url}
            </p>
          )}
        </div>

        {/* Hero Mobile */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Portada Móvil</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Recomendado: Imagen JPG/PNG vertical. Resolución 1080x1920 o similar.
          </p>

          <input
            ref={mobileInputRef}
            type="file"
            accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file, 'mobile')
            }}
            className="hidden"
            id="mobile-upload"
          />

          {!heroMobile ? (
            <label
              htmlFor="mobile-upload"
              className="flex flex-col items-center justify-center w-full aspect-[9/16] max-h-[400px] border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              ) : (
                <>
                  <IconPlus size={32} className="text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-500">Subir video o imagen</span>
                  <span className="text-xs text-neutral-400 mt-1">MP4, WebM, JPG, PNG, WebP (máx. 100MB)</span>
                </>
              )}
            </label>
          ) : (
            <div className="relative w-full aspect-[9/16] max-h-[400px] rounded-xl overflow-hidden bg-neutral-100">
              {heroMobile.tipo === 'video' ? (
                <video
                  src={heroMobile.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={heroMobile.url}
                  alt="Hero mobile"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                  {heroMobile.tipo === 'video' ? 'Video' : 'Imagen'}
                </span>
                <span className="p-1.5 bg-green-500 rounded-full">
                  <IconCheck size={14} className="text-white" />
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove('mobile')}
                  className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <IconX size={14} className="text-white" />
                </button>
              </div>
            </div>
          )}

          {heroMobile && (
            <p className="text-xs text-neutral-400 mt-2 truncate">
              URL: {heroMobile.url}
            </p>
          )}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || (!heroDesktop && !heroMobile)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Información */}
      <div className="mt-8 bg-primary-50 rounded-xl p-6">
        <h3 className="font-semibold text-primary-900 mb-2">Información</h3>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Los archivos se suben automáticamente a Bunny CDN</li>
          <li>• Puedes usar video (MP4, WebM) o imagen (JPG, PNG, WebP)</li>
          <li>• Tamaño máximo: 100MB</li>
          <li>• Los cambios se aplicarán en la portada de la tienda tras guardar</li>
        </ul>
      </div>
    </div>
  )
}
