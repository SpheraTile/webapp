'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  fill = false,
  className = '',
  sizes,
  priority = false,
}: ProductImageProps) {
  const [error, setError] = useState(false)

  // Generar color basado en el nombre del producto para el placeholder
  const generateColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 15%, 85%)`
  }

  if (error) {
    // Placeholder SVG con el nombre del producto
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          backgroundColor: generateColor(alt),
          position: fill ? 'absolute' : 'relative',
          inset: fill ? 0 : undefined,
          width: fill ? '100%' : undefined,
          height: fill ? '100%' : undefined,
        }}
      >
        <div className="text-center p-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="mx-auto mb-2 opacity-30"
          >
            <rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
            <rect x="8" y="8" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" />
            <rect x="26" y="8" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" />
            <rect x="8" y="26" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" />
            <rect x="26" y="26" width="14" height="14" rx="1" fill="currentColor" opacity="0.2" />
          </svg>
          <span className="text-xs text-neutral-500 uppercase tracking-wider line-clamp-2">
            {alt}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
