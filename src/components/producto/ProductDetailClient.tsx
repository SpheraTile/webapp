'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { StockBadge } from '@/components/ui/StockBadge'
import { PriceTag } from '@/components/ui/PriceTag'
import { ProductImage } from '@/components/ui/ProductImage'
import { ProductQRCode } from '@/components/ui/QRCode'
import { AddToCartButton } from '@/components/producto/AddToCartButton'
import { Producto } from '@/types'

// Translation keys for product attributes
const MATERIA_PRIMA_KEYS: Record<string, string> = {
  'Porcelánico': 'porcelain',
  'Gres': 'stoneware',
  'Azulejo': 'tile',
}

const ASPECTO_KEYS: Record<string, string> = {
  'Blanco': 'white',
  'Cemento': 'cement',
  'Colores': 'colors',
  'Madera': 'wood',
  'Mármol': 'marble',
  'Piedra': 'stone',
  'Terracota': 'terracotta',
}

const ACABADO_KEYS: Record<string, string> = {
  'Mate': 'matte',
  'Pulido': 'polished',
  'Satinado': 'satin',
  'Texturizado': 'textured',
  'Antideslizante': 'nonSlip',
}

function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
        <ProductImage
          src={images[selectedIndex]}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : 'border-transparent hover:border-neutral-300'
              }`}
            >
              <ProductImage
                src={img}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MobileGallery({ images, productName }: { images: string[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div className="p-4">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
        <ProductImage
          src={images[selectedIndex]}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Indicadores / Thumbnails */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 pt-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-primary-600'
                  : 'border-neutral-200'
              }`}
            >
              <ProductImage
                src={img}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Related products component
function RelatedProducts({ currentProduct }: { currentProduct: Producto }) {
  const [related, setRelated] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const t = useTranslations('products')

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // Buscar productos de la misma serie
        const params = new URLSearchParams()
        params.append('serie', currentProduct.serie)
        params.append('limit', '5')

        const response = await fetch(`/api/productos?${params}`)
        if (response.ok) {
          const data = await response.json()
          const productos = (data.productos || []).filter(
            (p: Producto) => p.id !== currentProduct.id
          )
          setRelated(productos.slice(0, 4))
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [currentProduct])

  if (loading) {
    return (
      <div className="mt-16 pb-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8">{t('relatedProducts')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-neutral-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (related.length === 0) {
    return null
  }

  return (
    <div className="mt-16 pb-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-8">{t('relatedProducts')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {related.map((producto) => (
          <Link
            key={producto.id}
            href={`/productos/${producto.slug}`}
            className="group bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-primary-300 hover:shadow-lg transition-all"
          >
            <div className="relative aspect-square bg-neutral-100">
              <ProductImage
                src={producto.imagen}
                alt={producto.nombre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600/80 text-white text-xs font-medium rounded">
                {currentProduct.serie}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                {producto.nombre}
              </h3>
              <p className="text-sm text-neutral-500 mb-2">{producto.formato}</p>
              <p className="font-bold text-primary-600">{producto.precio_m2.toFixed(2)}€/m²</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface ProductDetailClientProps {
  producto: Producto
}

export function ProductDetailClient({ producto }: ProductDetailClientProps) {
  const t = useTranslations('products')
  const tFilters = useTranslations('filters')
  const tNav = useTranslations('nav')

  // Combinar imagen principal con galería
  const allImages = [producto.imagen, ...producto.galeria]

  // Translate attribute values
  const materiaPrimaKey = producto.materia_prima ? MATERIA_PRIMA_KEYS[producto.materia_prima] : null
  const materiaPrimaLabel = materiaPrimaKey ? tFilters(materiaPrimaKey) : producto.materia_prima

  const aspectoKey = producto.aspecto ? ASPECTO_KEYS[producto.aspecto] : null
  const aspectoLabel = aspectoKey ? tFilters(aspectoKey) : producto.aspecto

  const acabadoKey = producto.acabado ? ACABADO_KEYS[producto.acabado] : null
  const acabadoLabel = acabadoKey ? tFilters(acabadoKey) : producto.acabado

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header showBack backHref="/productos" />
        {/* Migas de pan móvil */}
        <nav className="flex items-center gap-2 text-sm px-4 py-2 bg-neutral-50 border-b border-neutral-100">
          <Link href="/" className="text-neutral-500 hover:text-primary-600">{tNav('home')}</Link>
          <span className="text-neutral-300">/</span>
          <Link href="/productos" className="text-neutral-500 hover:text-primary-600">{tNav('products')}</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-primary-600 font-medium truncate">{producto.nombre}</span>
        </nav>
      </div>

      {/* Layout móvil */}
      <div className="lg:hidden">
        {/* Galería móvil */}
        <MobileGallery images={allImages} productName={producto.nombre} />

        {/* Información del producto */}
        <div className="p-4 space-y-4">
          {/* Referencia y Serie */}
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{t('reference')}: {producto.referencia}</span>
            <span>•</span>
            <span>{producto.serie}</span>
          </div>

          {/* Nombre y formato */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 uppercase tracking-wide">
              {producto.nombre}
            </h1>
            <p className="text-neutral-500 mt-1">{producto.formato}</p>
          </div>

          {/* Stock */}
          <StockBadge stock_m2={producto.stock_m2} m2_caja={producto.m2_caja} />

          {/* Precio */}
          <PriceTag precio_m2={producto.precio_m2} size="lg" />

          {/* Características */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-200">
            <div>
              <span className="text-sm text-neutral-500">{t('quality')}</span>
              <p className="font-medium text-neutral-900">{producto.calidad}</p>
            </div>
            <div>
              <span className="text-sm text-neutral-500">{t('material')}</span>
              <p className="font-medium text-neutral-900">{materiaPrimaLabel}</p>
            </div>
            <div>
              <span className="text-sm text-neutral-500">{t('aspect')}</span>
              <p className="font-medium text-neutral-900">{aspectoLabel}</p>
            </div>
            <div>
              <span className="text-sm text-neutral-500">{t('finish')}</span>
              <p className="font-medium text-neutral-900">{acabadoLabel}</p>
            </div>
          </div>

          {/* Información de empaquetado */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <h3 className="font-semibold text-neutral-900 mb-3">{t('packagingInfo')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('boxM2')}:</span>
                <span className="font-medium">{producto.m2_caja} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('boxPieces')}:</span>
                <span className="font-medium">{producto.piezas_caja}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('palletM2')}:</span>
                <span className="font-medium">{producto.m2_palet} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('palletBoxes')}:</span>
                <span className="font-medium">{producto.cajas_palet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('boxWeight')}:</span>
                <span className="font-medium">{producto.peso_caja_kg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{t('minOrder')}:</span>
                <span className="font-medium text-primary-600">{producto.pedido_minimo_m2} m²</span>
              </div>
            </div>
          </div>

          {/* Código QR */}
          <div className="flex items-center justify-center gap-4 py-4 border-y border-neutral-200">
            <ProductQRCode
              productSlug={producto.slug}
              size={80}
              expandable
              productName={producto.nombre}
              productFormat={producto.formato}
              isProductPage
            />
            <div className="text-sm">
              <p className="font-medium text-neutral-900">{t('qrCode')}</p>
              <p className="text-neutral-500">{t('qrCodeDescription')}</p>
            </div>
          </div>

          {/* Botón añadir a cesta */}
          <AddToCartButton producto={producto} />

          {/* Productos relacionados - Mobile */}
          <div className="mt-8">
            <RelatedProducts currentProduct={producto} />
          </div>
        </div>
      </div>

      {/* Layout desktop */}
      <div className="hidden lg:block pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
            <Link href="/" className="hover:text-primary-600">{tNav('home')}</Link>
            <span className="text-neutral-300">/</span>
            <Link href="/productos" className="hover:text-primary-600">{tNav('products')}</Link>
            <span className="text-neutral-300">/</span>
            <span className="text-primary-600 font-medium">{producto.nombre}</span>
          </nav>

          <div className="flex gap-12">
            {/* Columna izquierda: Galería */}
            <div className="flex-1 sticky top-28 self-start">
              <ProductGallery images={allImages} productName={producto.nombre} />
            </div>

            {/* Columna derecha: Info */}
            <div className="flex-1 max-w-xl">
              {/* Referencia y Serie */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-neutral-500">{t('reference')}: {producto.referencia}</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  {producto.serie}
                </span>
              </div>

              {/* Nombre */}
              <h1 className="text-4xl font-bold text-neutral-900 uppercase tracking-wide mb-4">
                {producto.nombre}
              </h1>

              {/* Formato */}
              <p className="text-xl text-neutral-600 mb-6">{producto.formato}</p>

              {/* Stock badge */}
              <div className="mb-6">
                <StockBadge stock_m2={producto.stock_m2} m2_caja={producto.m2_caja} />
              </div>

              {/* Precio destacado */}
              <div className="bg-neutral-50 rounded-2xl p-6 mb-8">
                <PriceTag precio_m2={producto.precio_m2} size="xl" />
                <p className="text-sm text-neutral-500 mt-2">
                  {t('pricePerM2Note')}
                </p>
              </div>

              {/* Características */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-neutral-900 mb-4">{t('characteristics')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <span className="text-sm text-neutral-500">{t('quality')}</span>
                    <p className="font-semibold text-neutral-900 text-lg">{producto.calidad}</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <span className="text-sm text-neutral-500">{t('material')}</span>
                    <p className="font-semibold text-neutral-900 text-lg">{materiaPrimaLabel}</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <span className="text-sm text-neutral-500">{t('aspect')}</span>
                    <p className="font-semibold text-neutral-900 text-lg">{aspectoLabel}</p>
                  </div>
                  <div className="bg-white border border-neutral-200 rounded-xl p-4">
                    <span className="text-sm text-neutral-500">{t('finish')}</span>
                    <p className="font-semibold text-neutral-900 text-lg">{acabadoLabel}</p>
                  </div>
                </div>
              </div>

              {/* Información de empaquetado */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-neutral-900 mb-4">{t('packagingAndOrder')}</h3>
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-neutral-100">
                      <tr>
                        <td className="px-4 py-3 text-neutral-500">{t('boxM2')}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 text-right">{producto.m2_caja} m²</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-neutral-500">{t('boxPieces')}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 text-right">{producto.piezas_caja}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-neutral-500">{t('palletM2')}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 text-right">{producto.m2_palet} m²</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-neutral-500">{t('palletBoxes')}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 text-right">{producto.cajas_palet}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-neutral-500">{t('boxWeight')}</td>
                        <td className="px-4 py-3 font-semibold text-neutral-900 text-right">{producto.peso_caja_kg} kg</td>
                      </tr>
                      <tr className="bg-primary-50">
                        <td className="px-4 py-3 text-primary-700 font-medium">{t('minOrder')}</td>
                        <td className="px-4 py-3 font-bold text-primary-700 text-right">{producto.pedido_minimo_m2} m²</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botón añadir a cesta */}
              <AddToCartButton producto={producto} />

              {/* Info adicional */}
              <div className="mt-8 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-800">
                  <strong>{t('deliveryTitle')}</strong> {t('deliveryNote')}
                </p>
              </div>

              {/* Código QR */}
              <div className="mt-8 bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center gap-6">
                  <ProductQRCode
                    productSlug={producto.slug}
                    size={100}
                    expandable
                    productName={producto.nombre}
                    productFormat={producto.formato}
                    isProductPage
                  />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{t('qrCode')}</h3>
                    <p className="text-sm text-neutral-500">{t('qrCodeDescription')}</p>
                    <p className="text-xs text-neutral-400 mt-2">{t('qrCodeClickToExpand')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productos relacionados */}
          <RelatedProducts currentProduct={producto} />
        </div>
      </div>
    </div>
  )
}
