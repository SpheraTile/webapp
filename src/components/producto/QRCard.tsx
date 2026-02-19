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
      className="qr-card bg-white flex flex-row items-stretch border-2 border-black p-[2mm]"
      style={{
        width: `${CARD_WIDTH_MM}mm`,
        height: `${CARD_HEIGHT_MM}mm`,
        fontFamily: 'Arial, sans-serif',
        gap: '2mm',
      }}
    >
      {/* Left side: Text */}
      <div className="flex-1 flex flex-col justify-center" style={{ minWidth: 0 }}>
        <div
          className="font-bold text-black leading-tight uppercase"
          style={{ fontSize: '13px', wordBreak: 'break-word' }}
          title={producto.nombre}
        >
          {producto.nombre}
        </div>
        <div
          className="font-mono text-black mt-[1mm]"
          style={{ fontSize: '13px' }}
        >
          {producto.referencia}
        </div>
      </div>

      {/* Right side: QR Code */}
      <div className="flex items-center justify-center" style={{ width: `${CARD_HEIGHT_MM - 6}mm` }}>
        <QRCodeSVG
          value={productUrl}
          size={110}
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

    /* Each QR card = one full page, horizontal layout, centered, no border */
    .qr-card {
      width: 100% !important;
      height: 100vh !important;
      margin: 0 !important;
      padding: 10mm !important;
      border: none !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10mm !important;
      page-break-after: always;
      page-break-inside: avoid;
    }

    /* Text side takes available space */
    .qr-card > div:first-child {
      flex: 1 !important;
      text-align: left !important;
    }

    /* QR side */
    .qr-card > div:last-child {
      width: 45vh !important;
      flex-shrink: 0 !important;
    }

    .qr-card svg {
      width: 100% !important;
      height: auto !important;
    }

    /* Hide everything else */
    header,
    nav,
    .no-print {
      display: none !important;
    }
  }
`
