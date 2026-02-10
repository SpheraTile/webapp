'use client'

import { QRCodeSVG } from 'qrcode.react'
import Image from 'next/image'
import { Producto } from '@/types'

interface QRCardProps {
  producto: Producto
  baseUrl?: string // Default: https://spheratile.com
}

const CARD_WIDTH_MM = 60
const CARD_HEIGHT_MM = 45

export function QRCard({ producto, baseUrl = 'https://spheratile.com' }: QRCardProps) {
  const productUrl = `${baseUrl}/producto/${producto.slug}`

  return (
    <div
      className="qr-card bg-white flex flex-col items-center justify-between p-2 border-2 border-neutral-900"
      style={{
        width: `${CARD_WIDTH_MM}mm`,
        height: `${CARD_HEIGHT_MM}mm`,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header - Logo */}
      <div className="w-full flex justify-center mb-1">
        <div className="text-[6px] font-bold text-neutral-900 tracking-wider">
          SPHERA TILE
        </div>
      </div>

      {/* Content - QR Code + Product Image */}
      <div className="flex-1 flex items-center justify-between w-full gap-1">
        {/* Product Image */}
        <div className="w-[20mm] h-[20mm] relative bg-neutral-100 rounded-sm overflow-hidden flex-shrink-0">
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="20mm"
          />
        </div>

        {/* QR Code */}
        <div className="w-[22mm] h-[22mm] flex-shrink-0 flex items-center justify-center bg-white rounded-sm">
          <QRCodeSVG
            value={productUrl}
            size={80}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>

      {/* Footer - Product Info */}
      <div className="w-full text-center mt-1 space-y-0.5">
        {/* Product Name - truncate with ellipsis */}
        <div className="text-[5px] font-semibold text-neutral-900 leading-tight truncate px-1" title={producto.nombre}>
          {producto.nombre}
        </div>

        {/* Format + Reference */}
        <div className="flex items-center justify-between text-[4px] text-neutral-600 px-1">
          <span className="font-medium">{producto.formato}</span>
          <span className="font-mono">{producto.referencia}</span>
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
