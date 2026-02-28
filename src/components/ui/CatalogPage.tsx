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
  almacen: string
  mostrar_en_catalogo: boolean
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
  showQR?: boolean
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function abbreviateUso(uso: string): string {
  if (uso === 'PAVIMENTO_Y_REVESTIMIENTO') {
    return 'PAV. Y REV.'
  }
  if (uso === 'PAVIMENTO_REVESTIMIENTO') {
    return 'PAV. Y REV.'
  }
  return uso
}

// Funciones auxiliares para clasificar productos
function isSquareProduct(format: string): boolean {
  const match = format.match(/^\d+[.,]?\d*x\d+[.,]?\d*$/i)
  if (!match) return false

  const parts = format.toLowerCase().split('x')
  if (parts.length === 2) {
    const first = parseFloat(parts[0].replace(',', '.'))
    const second = parseFloat(parts[1].replace(',', '.'))
    return Math.abs(first - second) < 1 // Permitir pequeña diferencia
  }
  return false
}

function isElongatedProduct(format: string): boolean {
  return (format.includes('22.5') && format.includes('119')) ||
    (format.includes('23.3') && format.includes('120')) ||
    (format.includes('23.3') && format.includes('119'))
}

function is60x120Product(format: string): boolean {
  // Más específico: formato que contiene 60x120 pero no es cuadrado (60x60)
  const parts = format.toLowerCase().split('x')
  if (parts.length === 2) {
    const first = parseFloat(parts[0].replace(',', '.'))
    const second = parseFloat(parts[1].replace(',', '.'))
    // Verificar que es 60x120 (con pequeñas variaciones decimales)
    return (Math.abs(first - 60) < 1 && Math.abs(second - 120) < 5) ||
      (Math.abs(second - 60) < 1 && Math.abs(first - 120) < 5)
  }
  return false
}

// Ordenar productos: cuadrados primero, luego 60x120, luego alargados, luego el resto
function sortProducts(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    const aIsSquare = isSquareProduct(a.formato)
    const bIsSquare = isSquareProduct(b.formato)
    const aIs60x120 = is60x120Product(a.formato)
    const bIs60x120 = is60x120Product(b.formato)
    const aIsElongated = isElongatedProduct(a.formato)
    const bIsElongated = isElongatedProduct(b.formato)

    // Prioridad: cuadrados (0), 60x120 (1), alargados (2), otros (3)
    const getPriority = (isSquare: boolean, is60x120: boolean, isElongated: boolean) => {
      if (isSquare) return 0
      if (is60x120) return 1
      if (isElongated) return 2
      return 3
    }

    const aPriority = getPriority(aIsSquare, aIs60x120, aIsElongated)
    const bPriority = getPriority(bIsSquare, bIs60x120, bIsElongated)

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Si misma prioridad, ordenar por nombre
    return a.nombre.localeCompare(b.nombre)
  })
}

function ProductCard({ product, isElongated, showQR = true }: { product: CatalogProduct, isElongated?: boolean, showQR?: boolean }) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://spheratile.com'

  const cell = { border: '1px solid #d4d4d4', padding: '6px 8px', fontSize: '12px', wordWrap: 'break-word' as const }
  const headerCell = { ...cell, backgroundColor: '#f5f5f5', fontWeight: 'bold' as const, width: '25%' }

  // Productos alargados: doble ancho, altura ajustada a ~75%
  const cardWidth = isElongated ? '750px' : '368px'
  const cardHeight = isElongated ? '380px' : '525px' // Aumentado de 505px a 525px para productos cuadrados

  // Detectar si el producto es cuadrado (formatos como 60x60, 45x45, etc.)
  const isSquare = product.formato.match(/^\d+[.,]?\d*x\d+[.,]?\d*$/i) && (() => {
    const parts = product.formato.toLowerCase().split('x')
    if (parts.length === 2) {
      const first = parseFloat(parts[0].replace(',', '.'))
      const second = parseFloat(parts[1].replace(',', '.'))
      return Math.abs(first - second) < 1 // Permitir pequeña diferencia
    }
    return false
  })()

  // Para productos cuadrados, calcular dimensiones explícitas en píxeles
  // El ancho del contenedor es cardWidth menos padding (approx 340px para normal, 710px para elongated)
  const imageContainerWidth = isElongated ? 710 : 340
  const squareSize = isSquare ? Math.round(imageContainerWidth * 0.7) : undefined // 70% para dejar espacio para el precio
  const containerPadding = isElongated ? 20 : 14

  return (
    <div style={{ width: cardWidth, height: cardHeight, border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, backgroundColor: '#fff' }}>
      {/* Product image - fills remaining space */}
      {isSquare ? (
        // Productos cuadrados: dimensiones explícitas en píxeles para html2canvas
        // Imagen más pequeña (90%) con padding para que no se recorte
        <div style={{ paddingTop: containerPadding + 'px', paddingBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
          <img
            src={product.imagen}
            alt={product.nombre}
            style={{ width: squareSize + 'px', height: squareSize + 'px', objectFit: 'contain' }}
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        // Productos no cuadrados
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
          <img
            src={product.imagen}
            alt={product.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Product info - compact, no flex grow */}
      <div style={{ padding: isElongated ? '16px 20px 16px 20px' : isSquare ? '12px 14px 12px 14px' : '16px 14px 18px 14px', display: 'flex', flexDirection: 'column' as const }}>
        {/* Name + Reference + QR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
            <p style={{ fontSize: isElongated ? '14px' : '13px', fontWeight: 'bold', color: '#171717', margin: '0 0 4px 0', lineHeight: '1.4', whiteSpace: 'nowrap' as const }}>{product.nombre}</p>
            <p style={{ fontSize: '9px', color: '#737373', margin: '0 0 6px 0', lineHeight: '1.2' }}>Ref: {product.referencia} · {product.serie}</p>
          </div>
          {showQR && (
            <QRCodeSVG
              value={`${baseUrl}/productos/${product.slug}`}
              size={50}
              level="L"
            />
          )}
        </div>

        {/* Stock - same size as name */}
        <p style={{ fontSize: isElongated ? '14px' : '13px', fontWeight: 'bold', color: '#dc2626', margin: '0 0 8px 0', lineHeight: '1.2' }}>
          Stock: {fmt(product.stock_m2)} m²
        </p>

        {/* Characteristics table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={headerCell}>Formato</td>
              <td style={{ ...cell, width: '25%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{product.formato}</span>
                {product.mostrar_en_catalogo && (
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: product.almacen === 'PRINCIPAL' ? '#22c55e' : '#3b82f6',
                    flexShrink: 0
                  }} />
                )}
              </td>
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
              <td style={{ ...cell, fontSize: abbreviateUso(product.uso) === product.uso ? '12px' : '9px' }}>
                {abbreviateUso(product.uso)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Technical data */}
        <p style={{ fontSize: '12px', color: '#737373', margin: '0 0 6px 0', lineHeight: '1.3' }}>
          {fmt(product.m2_caja)} m²/caja · {product.piezas_caja} pzs/caja · {product.cajas_palet} cajas/palet · {fmt(product.peso_caja_kg, 1)} kg/caja
        </p>

        {/* Price (hide if 0) */}
        {product.precio_m2 > 0 && (
          <div style={{ marginTop: '6px' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#dc2626', margin: 0, lineHeight: '1.2' }}>
              €{fmt(product.precio_m2)} <span style={{ fontSize: '8px', fontWeight: 'normal', color: '#737373' }}>/m²</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function CatalogPage({ products, pageNumber, totalPages, showQR = true }: CatalogPageProps) {
  // Ordenar productos: cuadrados primero, luego 60x120, luego alargados
  const sortedProducts = sortProducts(products)

  // Detectar productos alargados (22.5x119.5, 23.3x120 o similar)
  const isElongated = (product: CatalogProduct) =>
    (product.formato.includes('22.5') && product.formato.includes('119')) ||
    (product.formato.includes('23.3') && product.formato.includes('120')) ||
    (product.formato.includes('23.3') && product.formato.includes('119'))

  // Determinar el tipo de página según el primer producto ordenado
  const isElongatedPage = sortedProducts.length > 0 && isElongated(sortedProducts[0])

  // Layout para página de productos alargados (2 productos, uno encima del otro)
  const elongatedLayout = (
    <>
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} isElongated={true} showQR={showQR} />
      ))}
    </>
  )

  // Layout para página de productos normales (4 productos, 2x2 grid)
  const normalLayout = (
    <>
      {/* Fila superior */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
        {sortedProducts.slice(0, 2).map((product) => (
          <ProductCard key={product.id} product={product} isElongated={false} showQR={showQR} />
        ))}
      </div>
      {/* Fila inferior */}
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
        {sortedProducts.slice(2, 4).map((product) => (
          <ProductCard key={product.id} product={product} isElongated={false} showQR={showQR} />
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
