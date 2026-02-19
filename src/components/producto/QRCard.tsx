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
      className="qr-card bg-white flex flex-col border-2 border-neutral-900 p-[2mm]"
      style={{
        width: `${CARD_WIDTH_MM}mm`,
        height: `${CARD_HEIGHT_MM}mm`,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Top - Product Name */}
      <div className="text-center mb-[0.5mm]">
        <div className="text-[6px] font-bold text-neutral-900 leading-tight uppercase" title={producto.nombre}>
          {producto.nombre}
        </div>
      </div>

      {/* Format + Reference */}
      <div className="flex items-center justify-center gap-[1.5mm] text-[5px] text-neutral-700 mb-[0.5mm]">
        <span className="font-medium">{producto.formato}</span>
        <span>·</span>
        <span className="font-mono text-neutral-500">{producto.referencia}</span>
      </div>

      {/* QR Code - Large, takes most space */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[32mm] h-[32mm] flex items-center justify-center">
          <QRCodeSVG
            value={productUrl}
            size={128}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>

      {/* Bottom - Company Name */}
      <div className="text-center border-t border-neutral-300 pt-[1mm] mt-[0.5mm]">
        <div className="text-[5px] font-bold text-neutral-900 leading-tight">
          SPHERA TILE
        </div>
        <div className="text-[4px] text-neutral-600 leading-tight">
          {producto.formato}
        </div>
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
