'use client'

import { useState } from 'react'
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
  /** Enable click to expand */
  expandable?: boolean
  /** Product name to display in expanded view */
  productName?: string
  /** Product format to display in expanded view */
  productFormat?: string
  /** Whether we're already on the product page (hide link) */
  isProductPage?: boolean
}

export function ProductQRCode({
  productSlug,
  size = 128,
  className = '',
  showLabel = false,
  expandable = false,
  productName,
  productFormat,
  isProductPage = false,
}: ProductQRCodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Generate the full URL for the product page
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://spheratile.com'

  const productUrl = `${baseUrl}/productos/${productSlug}`

  const qrContent = (
    <div className={`flex flex-col items-center ${className}`}>
      <QRCode value={productUrl} size={size} />
      {showLabel && (
        <p className="text-xs text-neutral-500 mt-1 text-center">
          Escanea para ver producto
        </p>
      )}
    </div>
  )

  if (!expandable) {
    return qrContent
  }

  const handleGoToProduct = () => {
    setIsExpanded(false)
    if (!isProductPage) {
      window.location.href = `/productos/${productSlug}`
    }
  }

  return (
    <>
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        title="Clic para ampliar"
      >
        <QRCode value={productUrl} size={size} />
        {showLabel && (
          <p className="text-xs text-neutral-500 mt-1 text-center">
            Escanea para ver producto
          </p>
        )}
      </button>

      {/* Modal de QR ampliado */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              {/* Product info */}
              {productName && (
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-neutral-900 uppercase">{productName}</h3>
                  {productFormat && (
                    <p className="text-neutral-500">{productFormat}</p>
                  )}
                </div>
              )}

              <QRCode value={productUrl} size={240} />

              <p className="text-sm text-neutral-600 mt-4 text-center">
                Escanea este código QR para acceder al producto
              </p>

              <div className="flex flex-col gap-2 mt-6 w-full">
                {!isProductPage && (
                  <button
                    onClick={handleGoToProduct}
                    className="w-full px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Ver producto
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-full px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface ExpandableQRCodeProps {
  /** The URL or text to encode in the QR code */
  value: string
  /** Size in pixels when collapsed (default: 80) */
  size?: number
  /** Size in pixels when expanded (default: 240) */
  expandedSize?: number
  /** CSS class name */
  className?: string
  /** Label to show below QR */
  label?: string
}

export function ExpandableQRCode({
  value,
  size = 80,
  expandedSize = 240,
  className = '',
  label,
}: ExpandableQRCodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        title="Clic para ampliar"
      >
        <div className="relative">
          <QRCode value={value} size={size} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10 rounded">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-neutral-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
        {label && (
          <p className="text-xs text-neutral-500 mt-1 text-center">
            {label}
          </p>
        )}
      </button>

      {/* Modal de QR ampliado */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center">
              <QRCode value={value} size={expandedSize} />
              <p className="text-sm text-neutral-600 mt-4 text-center">
                Escanea este código QR
              </p>
              <p className="text-xs text-neutral-400 mt-2 font-mono break-all text-center max-w-[240px]">
                {value}
              </p>
              <button
                onClick={() => setIsExpanded(false)}
                className="mt-6 px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
