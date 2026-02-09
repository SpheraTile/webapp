'use client'

import { QRCodeSVG } from 'qrcode.react'

const COMPANY = {
  name: 'SPHERA TILE S.L.',
  email: 'info@spheratile.es',
  web: 'www.spheratile.com',
  address: 'AVDA. DEL MEDITERRÁNEO, 113 - 12200 ONDA, CASTELLÓN',
  nif: 'ESB12945796',
}

export interface CatalogProduct {
  id: string
  slug: string
  nombre: string
  referencia: string
  serie: string
  imagen: string
  formato: string
  calidad: string
  materia_prima: string
  aspecto: string
  acabado: string
  uso: string
  precio_m2: number
  stock_m2: number
  m2_caja: number
  piezas_caja: number
  cajas_palet: number
  peso_caja_kg: number
}

interface CatalogPageProps {
  products: CatalogProduct[]
  pageNumber: number
  totalPages: number
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function ProductCard({ product }: { product: CatalogProduct }) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://spheratile.com'

  const cell = { border: '1px solid #d4d4d4', padding: '3px 6px', fontSize: '7.5px' }
  const headerCell = { ...cell, backgroundColor: '#f5f5f5', fontWeight: 'bold' as const, width: '25%' }

  return (
    <div style={{ width: '368px', height: '505px', border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, backgroundColor: '#fff' }}>
      {/* Product image */}
      <div style={{ width: '368px', height: '210px', overflow: 'hidden' }}>
        <img
          src={product.imagen}
          alt={product.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Product info */}
      <div style={{ padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column' as const }}>
        {/* Name + Reference */}
        <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#171717', margin: '0 0 1px 0', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{product.nombre}</p>
        <p style={{ fontSize: '7.5px', color: '#737373', margin: '0 0 4px 0', lineHeight: '1.2' }}>Ref: {product.referencia} · {product.serie}</p>

        {/* Characteristics table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: '3px' }}>
          <tbody>
            <tr>
              <td style={headerCell}>Formato</td>
              <td style={{ ...cell, width: '25%' }}>{product.formato}</td>
              <td style={headerCell}>Calidad</td>
              <td style={{ ...cell, width: '25%' }}>{product.calidad}</td>
            </tr>
            <tr>
              <td style={headerCell}>Material</td>
              <td style={cell}>{product.materia_prima}</td>
              <td style={headerCell}>Acabado</td>
              <td style={cell}>{product.acabado}</td>
            </tr>
            <tr>
              <td style={headerCell}>Aspecto</td>
              <td style={cell}>{product.aspecto}</td>
              <td style={headerCell}>Uso</td>
              <td style={cell}>{product.uso}</td>
            </tr>
          </tbody>
        </table>

        {/* Technical data */}
        <p style={{ fontSize: '7px', color: '#737373', margin: '0 0 3px 0', lineHeight: '1.2' }}>
          {fmt(product.m2_caja)} m²/caja · {product.piezas_caja} pzs/caja · {product.cajas_palet} cajas/palet · {fmt(product.peso_caja_kg, 1)} kg/caja
        </p>

        {/* Price + Stock + QR */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', margin: 0, lineHeight: '1.2' }}>
              €{fmt(product.precio_m2)} <span style={{ fontSize: '8px', fontWeight: 'normal', color: '#737373' }}>/m²</span>
            </p>
            <p style={{ fontSize: '7.5px', color: '#737373', margin: 0 }}>
              Stock: {fmt(product.stock_m2)} m²
            </p>
          </div>
          <QRCodeSVG
            value={`${baseUrl}/productos/${product.slug}`}
            size={44}
            level="L"
          />
        </div>
      </div>
    </div>
  )
}

export function CatalogPage({ products, pageNumber, totalPages }: CatalogPageProps) {
  const topRow = products.slice(0, 2)
  const bottomRow = products.slice(2, 4)

  return (
    <div style={{ width: '800px', height: '1130px', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', boxSizing: 'border-box' as const }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 6px 20px', borderBottom: '1px solid #e5e5e5' }}>
        <img src="/logo-sphera.png" alt="SPHERA TILE" style={{ height: '22px' }} />
        <p style={{ fontSize: '7px', color: '#737373', margin: 0, textAlign: 'center' as const, flex: 1, padding: '0 8px' }}>
          {COMPANY.name} · {COMPANY.address} · {COMPANY.email}
        </p>
        <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#dc2626', margin: 0, whiteSpace: 'nowrap' as const }}>PRODUCT CATALOG</p>
      </div>

      {/* Products grid - centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '10px 20px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          {topRow.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {topRow.length === 1 && <div style={{ width: '368px', height: '505px' }} />}
        </div>
        {bottomRow.length > 0 && (
          <div style={{ display: 'flex', gap: '14px' }}>
            {bottomRow.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {bottomRow.length === 1 && <div style={{ width: '368px', height: '505px' }} />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 20px', borderTop: '1px solid #e5e5e5', fontSize: '7px', color: '#a3a3a3' }}>
        <span>{COMPANY.email} · {COMPANY.web}</span>
        <span>Pág {pageNumber} / {totalPages}</span>
      </div>
    </div>
  )
}
