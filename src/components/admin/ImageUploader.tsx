'use client'

import { useState, useRef } from 'react'
import { IconPlus, IconX, IconCheck } from '@/components/ui/Icons'

interface ImageUploaderProps {
  onUpload: (url: string) => void
  folder?: string
  className?: string
}

export function ImageUploader({ onUpload, folder = 'productos', className = '' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Preview local
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Subir a Bunny CDN
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir')
      }

      onUpload(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setPreview(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />

      {!preview ? (
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
        >
          <IconPlus size={32} className="text-neutral-400 mb-2" />
          <span className="text-sm text-neutral-500">Subir imagen</span>
          <span className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP (máx. 10MB)</span>
        </label>
      ) : (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-100">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          {!uploading && (
            <>
              <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
                <IconCheck size={16} className="text-white" />
              </div>
              <button
                onClick={handleClear}
                className="absolute top-2 left-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              >
                <IconX size={16} className="text-white" />
              </button>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}

interface MultiImageUploaderProps {
  onUpload: (urls: string[]) => void
  existingImages?: string[]
  folder?: string
  maxImages?: number
  className?: string
}

export function MultiImageUploader({
  onUpload,
  existingImages = [],
  folder = 'productos',
  maxImages = 10,
  className = '',
}: MultiImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (files.length > remainingSlots) {
      setError(`Solo puedes subir ${remainingSlots} imagen(es) más`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('files', file))
      formData.append('folder', folder)

      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir')
      }

      const newUrls = data.uploaded.map((u: { url: string }) => u.url)
      const updatedImages = [...images, ...newUrls]
      setImages(updatedImages)
      onUpload(updatedImages)

      if (data.errors?.length > 0) {
        setError(`${data.errors.length} archivo(s) no se pudieron subir`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imágenes')
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onUpload(updatedImages)
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
            <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <IconX size={14} className="text-white" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFilesSelect}
              className="hidden"
              id="multi-image-upload"
            />
            <label
              htmlFor="multi-image-upload"
              className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              ) : (
                <>
                  <IconPlus size={24} className="text-neutral-400" />
                  <span className="text-xs text-neutral-400 mt-1">Añadir</span>
                </>
              )}
            </label>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <p className="text-xs text-neutral-400 mt-2">
        {images.length} de {maxImages} imágenes
      </p>
    </div>
  )
}
