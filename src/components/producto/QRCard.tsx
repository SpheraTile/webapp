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
      {/* Product Name - 12px, smaller for multi-line titles */}
      <div className="text-center mb-[2mm]">
        <div
          className="font-bold text-black leading-tight uppercase"
          style={{ fontSize: '12px' }}
          title={producto.nombre}
        >
          {producto.nombre}
        </div>
      </div>

      {/* Reference - 11px */}
      <div className="text-center mb-[2mm]">
        <div
          className="font-mono text-black"
          style={{ fontSize: '11px' }}
        >
          {producto.referencia}
        </div>
      </div>

      {/* QR Code - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center w-full">
        <QRCodeSVG
          value={productUrl}
          size={105}
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  )
}

// Print styles - to be included in the page
export const qrCardPrintStyles = `
  @media print {
    @page {
      size: auto;
      margin: 5mm;
    }

    .qr-card {
      page-break-inside: avoid;
      break-inside: avoid;
      float: left;
      margin: 2mm;
    }

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
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    /* Hide everything else */
    header,
    nav,
    .no-print {
      display: none !important;
    }
  }
`
