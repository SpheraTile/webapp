import { Producto } from '@/types'

/**
 * Detecta si un producto es alargado (formato 22.5x119.5)
 */
export function isElongatedProduct(product: Producto): boolean {
  return product.formato.includes('22.5') && product.formato.includes('119')
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
  // Separar productos por tipo
  const elongated = products.filter(isElongatedProduct)
  const normal = products.filter(p => !isElongatedProduct(p))

  // Combinar: alargados primero, luego normales
  return [...elongated, ...normal]
}
