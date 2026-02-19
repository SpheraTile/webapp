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
      className="qr-card bg-white flex flex-col border-2 border-black p-[2mm]"
      style={{
        width: `${CARD_WIDTH_MM}mm`,
        height: `${CARD_HEIGHT_MM}mm`,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Top - Product Name */}
      <div className="text-center mb-[0.5mm]">
        <div className="text-[10px] font-bold text-black leading-tight uppercase" title={producto.nombre}>
          {producto.nombre}
        </div>
      </div>

      {/* Format + Reference */}
      <div className="flex items-center justify-center gap-[1.5mm] text-[10px] text-black mb-[0.5mm]">
        <span className="font-medium">{producto.formato}</span>
        <span>·</span>
        <span className="font-mono text-black">{producto.referencia}</span>
      </div>

      {/* QR Code - Large, takes most space */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[28mm] h-[28mm] flex items-center justify-center">
          <QRCodeSVG
            value={productUrl}
            size={112}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>

      {/* Bottom - Company Name */}
      <div className="text-center border-t border-black pt-[1mm] mt-[0.5mm]">
        <div className="text-[10px] font-bold text-black leading-tight">
          SPHERA TILE
        </div>
        <div className="text-[10px] text-black leading-tight">
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
