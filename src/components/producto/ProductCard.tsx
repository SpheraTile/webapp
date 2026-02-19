'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Producto } from '@/types'
import { StockBadge } from '@/components/ui/StockBadge'
import { PriceTag } from '@/components/ui/PriceTag'
import { ProductImage } from '@/components/ui/ProductImage'

interface ProductCardProps {
  producto: Producto
  className?: string
  variant?: 'grid' | 'list'
  esAlargado?: boolean
  aspectRatio?: string // Nueva prop para aspect ratio personalizado
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

export function ProductCard({ producto, className = '', variant = 'grid', esAlargado = false, aspectRatio }: ProductCardProps) {
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

  if (variant === 'list') {
    return (
      <Link
        href={`/productos/${producto.slug}`}
        className={`block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      >
        {/* Imagen del producto - ancho completo */}
        <div className="relative w-full aspect-[16/9] bg-neutral-100">
          <EstadoBadge estado={producto.estado_producto || 'normal'} t={t} />
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
            Ref: {producto.referencia || producto.id} · {materiaPrimaLabel}
          </p>

          {/* Formato y características */}
          <div className="flex flex-wrap gap-2 text-sm text-neutral-600 mb-3">
            <span className="px-2 py-1 bg-neutral-100 rounded">{producto.formato}</span>
            <span className="px-2 py-1 bg-neutral-100 rounded">{producto.calidad}</span>
            <span className="px-2 py-1 bg-neutral-100 rounded">{acabadoLabel}</span>
            {tipoPiezaLabel && tipoPiezaKey !== 'base' && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">{tipoPiezaLabel}</span>
            )}
            {usoLabel && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{usoLabel}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Badge de stock */}
            <StockBadge stock_m2={producto.stock_m2} m2_caja={producto.m2_caja} />

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
      className={`product-card block bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${esAlargado ? 'w-full' : ''} ${className}`}
    >
      {/* Imagen del producto */}
      <div
        className={`relative bg-neutral-100 overflow-hidden ${
          aspectRatio
            ? `aspect-[${aspectRatio}]`
            : esAlargado
            ? 'aspect-[8/3]'
            : 'aspect-product'
        }`}
      >
        <EstadoBadge estado={producto.estado_producto || 'normal'} t={t} />
        <ProductImage
          src={producto.imagen}
          alt={producto.nombre}
          fill
          className="object-cover"
          sizes={esAlargado ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
        />
      </div>

      {/* Información del producto */}
      <div className={`p-3 ${esAlargado ? 'space-y-1' : 'space-y-2'}`}>
        {/* Nombre */}
        <h3 className={`font-semibold text-neutral-900 uppercase tracking-wide line-clamp-2 ${esAlargado ? 'text-xs' : 'text-sm'}`}>
          {producto.nombre}
        </h3>

        {/* Formato y tipo */}
        <div className={`flex items-center gap-2 text-neutral-500 ${esAlargado ? 'text-xs' : 'text-sm'}`}>
          <span>{producto.formato}</span>
          {tipoPiezaLabel && tipoPiezaKey !== 'base' && (
            <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded">
              {tipoPiezaLabel}
            </span>
          )}
        </div>

        {/* Badge de stock */}
        <StockBadge stock_m2={producto.stock_m2} m2_caja={producto.m2_caja} />

        {/* Precio */}
        <PriceTag precio_m2={producto.precio_m2} size={esAlargado ? 'sm' : 'md'} />
      </div>
    </Link>
  )
}
