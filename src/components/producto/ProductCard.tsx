'use client'

import Link from 'next/link'
import { Producto, LABELS_TIPO_PIEZA, LABELS_USO } from '@/types'
import { StockBadge } from '@/components/ui/StockBadge'
import { PriceTag } from '@/components/ui/PriceTag'
import { ProductImage } from '@/components/ui/ProductImage'

interface ProductCardProps {
  producto: Producto
  className?: string
  variant?: 'grid' | 'list'
}

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'normal') return null

  const config = {
    oferta: { bg: 'bg-red-500', text: 'OFERTA' },
    novedad: { bg: 'bg-primary-600', text: 'NOVEDAD' },
  }

  const { bg, text } = config[estado as keyof typeof config] || { bg: 'bg-neutral-500', text: estado }

  return (
    <span className={`absolute top-2 left-2 ${bg} text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10`}>
      {text}
    </span>
  )
}

export function ProductCard({ producto, className = '', variant = 'grid' }: ProductCardProps) {
  const tipoPiezaLabel = producto.tipo_pieza ? LABELS_TIPO_PIEZA[producto.tipo_pieza] : ''
  const usoLabel = producto.uso ? LABELS_USO[producto.uso] : ''

  if (variant === 'list') {
    return (
      <Link
        href={`/productos/${producto.slug}`}
        className={`block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      >
        {/* Imagen del producto - ancho completo */}
        <div className="relative w-full aspect-[16/9] bg-neutral-100">
          <EstadoBadge estado={producto.estado_producto || 'normal'} />
          <ProductImage
            src={producto.imagen}
            alt={producto.nombre}
            fill
            className="object-cover"
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
            Ref: {producto.referencia || producto.id} · {producto.materia_prima}
          </p>

          {/* Formato y características */}
          <div className="flex flex-wrap gap-2 text-sm text-neutral-600 mb-3">
            <span className="px-2 py-1 bg-neutral-100 rounded">{producto.formato}</span>
            <span className="px-2 py-1 bg-neutral-100 rounded">{producto.calidad}</span>
            <span className="px-2 py-1 bg-neutral-100 rounded">{producto.acabado}</span>
            {tipoPiezaLabel && tipoPiezaLabel !== 'Base' && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">{tipoPiezaLabel}</span>
            )}
            {usoLabel && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{usoLabel}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Badge de stock */}
            <StockBadge stock_m2={producto.stock_m2} />

            {/* Precio */}
            <PriceTag precio_m2={producto.precio_m2} size="lg" />
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/productos/${producto.slug}`}
      className={`product-card block ${className}`}
    >
      {/* Imagen del producto */}
      <div className="relative aspect-product bg-neutral-100 overflow-hidden">
        <EstadoBadge estado={producto.estado_producto || 'normal'} />
        <ProductImage
          src={producto.imagen}
          alt={producto.nombre}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
      </div>

      {/* Información del producto */}
      <div className="p-3 space-y-2">
        {/* Nombre */}
        <h3 className="font-semibold text-neutral-900 text-sm uppercase tracking-wide line-clamp-2">
          {producto.nombre}
        </h3>

        {/* Formato y tipo */}
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>{producto.formato}</span>
          {tipoPiezaLabel && tipoPiezaLabel !== 'Base' && (
            <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
              {tipoPiezaLabel}
            </span>
          )}
        </div>

        {/* Badge de stock */}
        <StockBadge stock_m2={producto.stock_m2} />

        {/* Precio */}
        <PriceTag precio_m2={producto.precio_m2} size="md" />
      </div>
    </Link>
  )
}
