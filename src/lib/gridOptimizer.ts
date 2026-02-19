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
 * Detecta si un formato es alargado.
 * Un formato es alargado si la relación entre el lado más largo
 * y el más corto es >= 2 (uno es al menos el doble del otro).
 */
export function isElongatedFormat(formato: string): boolean {
  const dims = parseFormatDimensions(formato)
  if (!dims) return false
  const [a, b] = dims
  const ratio = Math.max(a, b) / Math.min(a, b)
  return ratio >= 2
}

/**
 * Detecta si un producto es alargado basándose en su formato.
 */
export function isElongatedProduct(product: Producto): boolean {
  return isElongatedFormat(product.formato)
}

/**
 * Optimiza el orden de los productos para minimizar huecos en el grid.
 *
 * Estrategia: Separa productos alargados de normales y coloca los alargados primero.
 * Esto funciona porque en un grid de 4 columnas, los productos alargados (col-span-2)
 * encajan perfectamente de 2 en 2, mientras los normales (col-span-1) llenan cualquier espacio.
 *
 * @param products - Array de productos a optimizar
 * @returns Array de productos con orden optimizado
 */
export function optimizeGridLayout(products: Producto[]): Producto[] {
  const elongated = products.filter(isElongatedProduct)
  const normal = products.filter(p => !isElongatedProduct(p))
  return [...elongated, ...normal]
}

