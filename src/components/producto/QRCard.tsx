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
      className="qr-card bg-white flex flex-col border-2 border-neutral-900"
      style={{
        width: `${CARD_WIDTH_MM}mm`,
        height: `${CARD_HEIGHT_MM}mm`,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Top section - Product Image + QR Code */}
      <div className="flex-1 flex p-[2mm] gap-[2mm]">
        {/* Product Image - Left */}
        <div className="w-[26mm] h-[26mm] relative bg-neutral-100 overflow-hidden flex-shrink-0">
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="26mm"
          />
        </div>

        {/* QR Code - Right */}
        <div className="w-[26mm] h-[26mm] flex-shrink-0 flex items-center justify-center bg-white">
          <QRCodeSVG
            value={productUrl}
            size={100}
            level="M"
            includeMargin={false}
          />
        </div>
      </div>

      {/* Middle section - Product Info */}
      <div className="px-[2mm] text-center space-y-[0.5mm]">
        {/* Product Name */}
        <div className="text-[6px] font-bold text-neutral-900 leading-tight uppercase" title={producto.nombre}>
          {producto.nombre}
        </div>

        {/* Format + Reference */}
        <div className="flex items-center justify-center gap-[2mm] text-[5px] text-neutral-700">
          <span className="font-medium">{producto.formato}</span>
          <span className="font-mono text-neutral-500">{producto.referencia}</span>
        </div>
      </div>

      {/* Bottom section - Company Info */}
      <div className="px-[2mm] pb-[1mm] mt-auto">
        <div className="text-center border-t border-neutral-300 pt-[1mm]">
          <div className="text-[5px] font-bold text-neutral-900 leading-tight">
            SPHERA TILE
          </div>
          <div className="text-[4px] text-neutral-600 leading-tight mt-[0.5mm]">
            info@spheratile.es
          </div>
          <div className="text-[4px] text-neutral-600 leading-tight">
            www.spheratile.com
          </div>
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
