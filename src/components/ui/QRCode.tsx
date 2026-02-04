'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  /** The URL or text to encode in the QR code */
  value: string
  /** Size in pixels (default: 128) */
  size?: number
  /** Include a logo in the center */
  includeMargin?: boolean
  /** Background color (default: white) */
  bgColor?: string
  /** Foreground color (default: black) */
  fgColor?: string
  /** CSS class name */
  className?: string
}

export function QRCode({
  value,
  size = 128,
  includeMargin = true,
  bgColor = '#ffffff',
  fgColor = '#000000',
  className = '',
}: QRCodeProps) {
  return (
    <div className={`inline-block ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        includeMargin={includeMargin}
        level="M"
      />
    </div>
  )
}

interface ProductQRCodeProps {
  /** Product slug for the URL */
  productSlug: string
  /** Size in pixels (default: 128) */
  size?: number
  /** CSS class name */
  className?: string
  /** Show label below QR */
  showLabel?: boolean
}

export function ProductQRCode({
  productSlug,
  size = 128,
  className = '',
  showLabel = false,
}: ProductQRCodeProps) {
  // Generate the full URL for the product page
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://spheratile.com'

  const productUrl = `${baseUrl}/productos/${productSlug}`

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <QRCode value={productUrl} size={size} />
      {showLabel && (
        <p className="text-xs text-neutral-500 mt-1 text-center">
          Escanea para ver producto
        </p>
      )}
    </div>
  )
}
