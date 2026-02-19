'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Producto } from '@/types'

interface QRCardProps {
  producto: Producto
  baseUrl?: string
}

const CARD_WIDTH_MM = 60
const CARD_HEIGHT_MM = 45

export function QRCard({ producto, baseUrl }: QRCardProps) {
  // Usar window.location.origin dinámicamente como en ProductQRCode
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://app.spheratile.es'

  const productUrl = `${origin}/productos/${producto.slug}`

  return (
    <div
      className="qr-card bg-white flex flex-col items-center justify-center border-2 border-black p-[3mm]"
      style={{
        width: `${CARD_WIDTH_MM}mm`,
        height: `${CARD_HEIGHT_MM}mm`,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Product Name - 15px, smaller for multi-line titles */}
      <div className="text-center mb-[1mm]">
        <div
          className="font-bold text-black leading-tight uppercase"
          style={{ fontSize: '15px' }}
          title={producto.nombre}
        >
          {producto.nombre}
        </div>
      </div>

      {/* Reference - 15px */}
      <div className="text-center mb-[1mm]">
        <div
          className="font-mono text-black"
          style={{ fontSize: '15px' }}
        >
          {producto.referencia}
        </div>
      </div>

      {/* QR Code - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center w-full">
        <QRCodeSVG
          value={productUrl}
          size={95}
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  )
}

// Print styles - each QR card fills one full page, centered, no borders
export const qrCardPrintStyles = `
  @media print {
    @page {
      margin: 5mm;
      size: auto;
    }

    /* Hide everything except print area */
    body * {
      visibility: hidden;
    }

    #qr-cards-print-area,
    #qr-cards-print-area * {
      visibility: visible;
    }

    #qr-cards-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }

    /* Each QR card = one full page, centered, no border */
    .qr-card {
      width: 100% !important;
      height: 100vh !important;
      margin: 0 !important;
      padding: 5mm !important;
      border: none !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      page-break-after: always;
      page-break-inside: avoid;
    }

    /* Make QR SVG fill available width */
    .qr-card svg {
      width: 100% !important;
      height: auto !important;
      max-width: 100% !important;
    }

    /* Scale text to fit */
    .qr-card div {
      width: 100% !important;
      text-align: center !important;
    }

    /* Hide everything else */
    header,
    nav,
    .no-print {
      display: none !important;
    }
  }
`
