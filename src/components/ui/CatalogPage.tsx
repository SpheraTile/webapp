'use client'

import { QRCodeSVG } from 'qrcode.react'

const COMPANY = {
  name: 'SPHERA TILE S.L.',
  email: 'info@spheratile.es',
  web: 'www.spheratile.com',
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

function ProductCard({ product, isElongated }: { product: CatalogProduct, isElongated?: boolean }) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://spheratile.com'

  const cell = { border: '1px solid #d4d4d4', padding: '4px 6px', fontSize: '9px', wordWrap: 'break-word' as const }
  const headerCell = { ...cell, backgroundColor: '#f5f5f5', fontWeight: 'bold' as const, width: '25%' }

  // Productos alargados: doble ancho, altura ajustada a ~75%
  const cardWidth = isElongated ? '750px' : '368px'
  const cardHeight = isElongated ? '380px' : '505px'

  return (
    <div style={{ width: cardWidth, height: cardHeight, border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, backgroundColor: '#fff' }}>
      {/* Product image - fills remaining space */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <img
          src={product.imagen}
          alt={product.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          crossOrigin="anonymous"
        />
      </div>

      {/* Product info - compact, no flex grow */}
      <div style={{ padding: isElongated ? '16px 20px 16px 20px' : '16px 14px 18px 14px', display: 'flex', flexDirection: 'column' as const }}>
        {/* Name + Reference */}
        <p style={{ fontSize: isElongated ? '14px' : '13px', fontWeight: 'bold', color: '#171717', margin: '0 0 4px 0', lineHeight: '1.4', whiteSpace: 'nowrap' as const }}>{product.nombre}</p>
        <p style={{ fontSize: '9px', color: '#737373', margin: '0 0 6px 0', lineHeight: '1.2' }}>Ref: {product.referencia} · {product.serie}</p>

        {/* Stock - same size as name */}
        <p style={{ fontSize: isElongated ? '14px' : '13px', fontWeight: 'bold', color: '#171717', margin: '0 0 8px 0', lineHeight: '1.2' }}>
          Stock: {fmt(product.stock_m2)} m²
        </p>

        {/* Characteristics table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: '6px' }}>
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
        <p style={{ fontSize: '12px', color: '#737373', margin: '0 0 6px 0', lineHeight: '1.3' }}>
          {fmt(product.m2_caja)} m²/caja · {product.piezas_caja} pzs/caja · {product.cajas_palet} cajas/palet · {fmt(product.peso_caja_kg, 1)} kg/caja
        </p>

        {/* Price (hide if 0) + QR */}
        <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {product.precio_m2 > 0 && (
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', margin: 0, lineHeight: '1.2' }}>
              €{fmt(product.precio_m2)} <span style={{ fontSize: '8px', fontWeight: 'normal', color: '#737373' }}>/m²</span>
            </p>
          )}
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
  // Detectar productos alargados (22.5x119.5 o similar)
  const isElongated = (product: CatalogProduct) =>
    product.formato.includes('22.5') && product.formato.includes('119')

  // Determinar el tipo de página según el primer producto
  const isElongatedPage = products.length > 0 && isElongated(products[0])

  // Layout para página de productos alargados (2 productos, uno encima del otro)
  const elongatedLayout = (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isElongated={true} />
      ))}
    </>
  )

  // Layout para página de productos normales (4 productos, 2x2 grid)
  const normalLayout = (
    <>
      {/* Fila superior */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
        {products.slice(0, 2).map((product) => (
          <ProductCard key={product.id} product={product} isElongated={false} />
        ))}
      </div>
      {/* Fila inferior */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
        {products.slice(2, 4).map((product) => (
          <ProductCard key={product.id} product={product} isElongated={false} />
        ))}
      </div>
    </>
  )

  return (
    <div style={{ width: '800px', height: '1130px', fontFamily: 'Arial, Helvetica, sans-serif', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', boxSizing: 'border-box' as const }}>
      {/* Products grid - centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isElongatedPage ? '15px' : '10px', padding: '20px' }}>
        {isElongatedPage ? elongatedLayout : normalLayout}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 20px', borderTop: '1px solid #e5e5e5', fontSize: '7px', color: '#a3a3a3' }}>
        <span>{COMPANY.email} · {COMPANY.web}</span>
        <span>Pág {pageNumber} / {totalPages}</span>
      </div>
    </div>
  )
}
