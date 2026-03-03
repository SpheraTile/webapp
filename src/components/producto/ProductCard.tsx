'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Producto } from '@/types'
import { StockBadge } from '@/components/ui/StockBadge'
import { PriceTag } from '@/components/ui/PriceTag'
import { ProductImage } from '@/components/ui/ProductImage'
import { AlmacenIndicator } from '@/components/ui/AlmacenIndicator'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'

import { GridFormatType } from '@/lib/gridOptimizer'

interface ProductCardProps {
  producto: Producto
  className?: string
  variant?: 'grid' | 'list'
  formatType?: GridFormatType | 'other'
  onAlmacenChange?: (productoId: string, nuevoAlmacen: 'PRINCIPAL' | 'LOGISTICS' | 'AMBOS') => void
  onEstadoChange?: (productoId: string, nuevoEstado: 'normal' | 'oferta' | 'novedad') => void
}

// Translation keys for product attributes
const MATERIA_PRIMA_KEYS: Record<string, string> = {
  'Porcelánico': 'porcelain',
  'Gres': 'stoneware',
  'Azulejo': 'tile',
}

const ACABADO_KEYS: Record<string, string> = {
  'Mate': 'matte',
  'Pulido': 'polished',
  'Satinado': 'satin',
  'Texturizado': 'textured',
}

const TIPO_PIEZA_KEYS: Record<string, string> = {
  'base': 'base',
  'decorado': 'decorated',
  'multistep': 'multistep',
}

const USO_KEYS: Record<string, string> = {
  'pavimento': 'floor',
  'revestimiento': 'wall',
  'pavimento_revestimiento': 'floorWall',
}

const ESTADO_KEYS: Record<string, string> = {
  'oferta': 'offer',
  'novedad': 'new',
}

function EstadoBadge({ estado, t }: { estado: string; t: (key: string) => string }) {
  if (estado === 'normal') return null

  const config = {
    oferta: { bg: 'bg-red-500' },
    novedad: { bg: 'bg-primary-600' },
  }

  const { bg } = config[estado as keyof typeof config] || { bg: 'bg-neutral-500' }
  const translationKey = ESTADO_KEYS[estado]
  const text = translationKey ? t(translationKey).toUpperCase() : estado.toUpperCase()

  return (
    <span className={`absolute top-2 left-2 ${bg} text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10`}>
      {text}
    </span>
  )
}

export function ProductCard({ producto, className = '', variant = 'grid', formatType = 'other', onAlmacenChange, onEstadoChange }: ProductCardProps) {
  const t = useTranslations('filters')

  // Get translated labels
  const tipoPiezaKey = producto.tipo_pieza ? TIPO_PIEZA_KEYS[producto.tipo_pieza] : null
  const tipoPiezaLabel = tipoPiezaKey ? t(tipoPiezaKey) : ''

  const usoKey = producto.uso ? USO_KEYS[producto.uso] : null
  const usoLabel = usoKey ? t(usoKey) : ''

  const materiaPrimaKey = producto.materia_prima ? MATERIA_PRIMA_KEYS[producto.materia_prima] : null
  const materiaPrimaLabel = materiaPrimaKey ? t(materiaPrimaKey) : producto.materia_prima

  const acabadoKey = producto.acabado ? ACABADO_KEYS[producto.acabado] : null
  const acabadoLabel = acabadoKey ? t(acabadoKey) : producto.acabado

  // Handle warehouse change - 3 states: PRINCIPAL -> LOGISTICS -> AMBOS -> PRINCIPAL
  const handleAlmacenToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAlmacenChange) {
      const nuevoAlmacen = producto.almacen === 'PRINCIPAL' ? 'LOGISTICS' : producto.almacen === 'LOGISTICS' ? 'AMBOS' : 'PRINCIPAL'
      onAlmacenChange(producto.id, nuevoAlmacen)
    }
  }

  // Handle estado change (novedad toggle)
  const handleEstadoToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEstadoChange) {
      const nuevoEstado = producto.estado_producto === 'novedad' ? 'normal' : 'novedad'
      onEstadoChange(producto.id, nuevoEstado)
    }
  }

  // Check if we should show quick actions
  const showQuickActions = onAlmacenChange || onEstadoChange

  // Quick actions component
  const QuickActions = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-2 p-2 bg-neutral-50 rounded-lg space-y-2"
    >
      {onEstadoChange && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">Novedad</span>
          <button
            onClick={handleEstadoToggle}
            className={`w-8 h-4 rounded-full transition-colors ${
              producto.estado_producto === 'novedad' ? 'bg-primary-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`block w-3 h-3 bg-white rounded-full transition-transform ${
                producto.estado_producto === 'novedad' ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      )}
      {onAlmacenChange && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">
            {producto.almacen === 'PRINCIPAL' ? 'Principal' : producto.almacen === 'LOGISTICS' ? 'Logistics' : 'Ambos'}
          </span>
          <div onClick={handleAlmacenToggle} className="cursor-pointer">
            <ToggleSwitch
              value={producto.almacen}
              onChange={() => onAlmacenChange(producto.id, producto.almacen === 'PRINCIPAL' ? 'LOGISTICS' : producto.almacen === 'LOGISTICS' ? 'AMBOS' : 'PRINCIPAL')}
            />
          </div>
        </div>
      )}
    </div>
  )

  if (variant === 'list') {
    return (
      <Link
        href={`/productos/${producto.slug}`}
        className={`group block bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      >
        {/* Imagen del producto - ancho completo */}
        <div className="relative w-full aspect-[16/9] bg-neutral-100 overflow-hidden">
          <EstadoBadge estado={producto.estado_producto || 'normal'} t={t} />
          <ProductImage
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover rounded-none group-hover:scale-105 transition-transform duration-300"
            sizes="100vw"
          />
        </div>

        {/* Información del producto */}
        <div className="p-4">
          {/* Nombre */}
          <h3 className="font-semibold text-neutral-900 text-base uppercase tracking-wide mb-1">
            {producto.nombre}
          </h3>

          {/* Referencia */}
          <p className="text-sm text-neutral-500 mb-3">
            Ref: {producto.referencia || producto.id} · {materiaPrimaLabel}
          </p>

          {/* Formato y características */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 mb-3">
            <span className="px-2 py-1 bg-neutral-100 rounded flex items-center gap-2">
              {producto.formato}
              <AlmacenIndicator almacen={producto.almacen} show={producto.mostrar_en_grid} />
            </span>
            <span className="px-2 py-1 bg-neutral-100 rounded">{producto.calidad}</span>
            <span className="px-2 py-1 bg-neutral-100 rounded">{acabadoLabel}</span>
            {tipoPiezaLabel && tipoPiezaKey !== 'base' && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">{tipoPiezaLabel}</span>
            )}
            {usoLabel && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{usoLabel}</span>
            )}
          </div>

          {/* Acciones rápidas */}
          {showQuickActions && <QuickActions />}

          <div className="flex items-center justify-between">
            {/* Badge de stock */}
            <StockBadge stock_m2={producto.stock_m2} m2_caja={producto.m2_caja} />

            {/* Precio - solo mostrar si existe */}
            {producto.precio_m2 > 0 && (
              <PriceTag precio_m2={producto.precio_m2} size="lg" />
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/productos/${producto.slug}`}
      className={`product-card group block bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${formatType === 'elongated' || formatType === '60x120' ? 'w-full' : ''} ${className}`}
    >
      {/* Imagen del producto */}
      <div
        className={`relative bg-neutral-100 overflow-hidden ${formatType === 'elongated'
            ? 'aspect-[3/1] md:aspect-[4/1]' // "Media fila de alto" (ancho muy grande respecto al alto)
            : formatType === '60x120'
              ? 'aspect-[2/1] md:aspect-[2/1]' // 2 columnas de ancho, 1 de alto
              : formatType === 'square'
                ? 'aspect-square' // 1 columna, verdadero cuadrado
                : 'aspect-product'
          }`}
      >
        <EstadoBadge estado={producto.estado_producto || 'normal'} t={t} />
        <ProductImage
          src={producto.imagen}
          alt={producto.nombre}
          fill
          className="object-cover rounded-none group-hover:scale-105 transition-transform duration-300"
          sizes={
            formatType === 'elongated' || formatType === '60x120'
              ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw" // Ocupa 2 columnas en grid-cols-4 en desktop => 50vw
              : "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
          }
        />
      </div>

      {/* Información del producto */}
      <div className={`p-3 ${formatType === 'elongated' || formatType === '60x120' ? 'space-y-1' : 'space-y-2'}`}>
        {/* Nombre */}
        <h3 className={`font-semibold text-neutral-900 uppercase tracking-wide line-clamp-2 ${formatType === 'elongated' ? 'text-xs' : 'text-sm'}`}>
          {producto.nombre}
        </h3>

        {/* Formato y tipo */}
        <div className={`flex items-center justify-between text-neutral-500 ${formatType === 'elongated' ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-center gap-2">
            <span>{producto.formato}</span>
            {tipoPiezaLabel && tipoPiezaKey !== 'base' && (
              <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
                {tipoPiezaLabel}
              </span>
            )}
          </div>
          <AlmacenIndicator almacen={producto.almacen} show={producto.mostrar_en_grid} />
        </div>

        {/* Badge de stock */}
        <StockBadge stock_m2={producto.stock_m2} m2_caja={producto.m2_caja} />

        {/* Acciones rápidas */}
        {showQuickActions && <QuickActions />}

        {/* Precio - solo mostrar si existe */}
        {producto.precio_m2 > 0 && (
          <PriceTag precio_m2={producto.precio_m2} size={formatType === 'elongated' ? 'sm' : 'md'} />
        )}
      </div>
    </Link>
  )
}
