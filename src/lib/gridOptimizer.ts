import { Producto } from '@/types'

/**
 * Parsea un formato como "23.3x120" o "23.3X120" y devuelve [ancho, alto].
 * Devuelve null si no se puede parsear.
 */
export function parseFormatDimensions(formato: string): [number, number] | null {
  const match = formato.match(/^(\d+(?:[.,]\d+)?)\s*[xX×]\s*(\d+(?:[.,]\d+)?)/)
  if (!match) return null
  const a = parseFloat(match[1].replace(',', '.'))
  const b = parseFloat(match[2].replace(',', '.'))
  if (isNaN(a) || isNaN(b) || a === 0 || b === 0) return null
  return [a, b]
}

/**
 * Detecta si un formato es cuadrado (~60x60).
 */
export function isSquareFormat(formato: string): boolean {
  const dims = parseFormatDimensions(formato)
  if (!dims) return false
  const [a, b] = dims
  return Math.abs(a - b) < 1 // diferencia menor a 1
}

/**
 * Detecta si un formato es alargado.
 * Según usuario: "menos de 40 de alto y mas de 100 de ancho"
 */
export function isElongatedFormat(formato: string): boolean {
  const dims = parseFormatDimensions(formato)
  if (!dims) return false
  const [a, b] = dims
  const alto = Math.min(a, b)
  const ancho = Math.max(a, b)
  return alto < 40 && ancho > 100
}

/**
 * Detecta si un formato es rectangular estándar (~60x120).
 */
export function is60x120Format(formato: string): boolean {
  const dims = parseFormatDimensions(formato)
  if (!dims) return false
  const [a, b] = dims
  const alto = Math.min(a, b)
  const ancho = Math.max(a, b)
  return Math.abs(alto - 60) < 2 && Math.abs(ancho - 120) < 5
}

/**
 * Detecta si un formato es un cuadrado estándar 60x60
 */
export function is60x60Format(formato: string): boolean {
  if (!isSquareFormat(formato)) return false
  const dims = parseFormatDimensions(formato)
  if (!dims) return false
  const [a] = dims
  return Math.abs(a - 60) < 0.2 // Muy cercano a 60
}

/**
 * Detecta si un formato es un cuadrado estándar 60.5x60.5
 */
export function is605x605Format(formato: string): boolean {
  if (!isSquareFormat(formato)) return false
  const dims = parseFormatDimensions(formato)
  if (!dims) return false
  const [a] = dims
  return Math.abs(a - 60.5) < 0.2 // Muy cercano a 60.5
}

export type GridFormatType = 'elongated' | '60x120' | 'square' | 'other'

export function getGridFormatType(formato: string): GridFormatType {
  if (isElongatedFormat(formato)) return 'elongated'
  if (is60x120Format(formato)) return '60x120'
  if (isSquareFormat(formato)) return 'square'
  return 'other'
}

/**
 * Ordena productos para el grid:
 * 1. 60x60
 * 2. 60.5x60.5
 * 3. 60x120
 * 4. El resto
 */
export function sortGridProducts(products: Producto[]): Producto[] {
  return [...products].sort((a, b) => {
    const getPriority = (formato: string) => {
      if (is60x60Format(formato)) return 0
      if (is605x605Format(formato)) return 1
      if (is60x120Format(formato)) return 2
      return 3 // Resto (alargados u otros formatos)
    }

    const aPriority = getPriority(a.formato)
    const bPriority = getPriority(b.formato)

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // A igual prioridad, ordenar por nombre alfabéticamente
    return a.nombre.localeCompare(b.nombre)
  })
}

/**
 * Detecta si un producto es alargado basándose en su formato.
 */
export function isElongatedProduct(product: Producto): boolean {
  return isElongatedFormat(product.formato)
}

// Ya no se usa la antigua estrategia de gridOptimizer, pero la mantenemos para retrocompatibilidad
export function optimizeGridLayout(products: Producto[]): Producto[] {
  return sortGridProducts(products)
}

