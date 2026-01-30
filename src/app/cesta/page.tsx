'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { CartItem } from '@/components/cesta/CartItem'
import { CartSummary } from '@/components/cesta/CartSummary'
import { useCesta } from '@/context/CestaContext'
import { IconCart } from '@/components/ui/Icons'

export default function CestaPage() {
  const { items, vaciarCesta } = useCesta()
  const [enviando, setEnviando] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numeroPedido, setNumeroPedido] = useState<string | null>(null)
  const t = useTranslations('cart')

  const handleEnviarPedido = async () => {
    setEnviando(true)
    setError(null)

    try {
      const pedidoData = {
        items: items.map((item) => ({
          productoId: item.producto.id,
          producto_nombre: item.producto.nombre,
          producto_referencia: item.producto.referencia || '',
          cantidad_m2: item.cantidad_m2,
          cantidad_cajas: item.cantidad_cajas,
          precio_m2: item.producto.precio_m2,
          subtotal: item.cantidad_m2 * item.producto.precio_m2,
        })),
      }

      const response = await fetch('/api/mis-pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('errorSending'))
      }

      setNumeroPedido(data.numero_pedido)
      setPedidoEnviado(true)
      vaciarCesta()
    } catch (err: any) {
      console.error('Error enviando pedido:', err)
      setError(err.message || t('errorSending'))
    } finally {
      setEnviando(false)
    }
  }

  // Pantalla de confirmación
  if (pedidoEnviado) {
    return (
      <div className="min-h-screen bg-white">
        <DesktopNav />
        <div className="lg:hidden">
          <Header titulo={t('orderSent')} />
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-16 lg:pt-40">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary-600"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {t('orderSentSuccess')}
          </h2>
          {numeroPedido && (
            <p className="text-primary-600 font-semibold mb-2">
              {t('orderNumber')}: {numeroPedido}
            </p>
          )}
          <p className="text-neutral-600 text-center mb-8">
            {t('orderSentMessage')}
          </p>
          <div className="flex gap-4">
            <Link href="/cuenta/pedidos" className="btn-secondary">
              {t('viewMyOrders')}
            </Link>
            <Link href="/productos" className="btn-primary">
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Cesta vacía
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <DesktopNav />
        <div className="lg:hidden">
          <Header titulo={t('title')} />
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-16 lg:pt-40">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
            <IconCart size={40} className="text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {t('empty')}
          </h2>
          <p className="text-neutral-600 text-center mb-8">
            {t('emptyDesc')}
          </p>
          <Link href="/productos" className="btn-primary">
            {t('viewProducts')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-48 lg:pb-0">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo={t('title')} />
      </div>

      {/* Contenedor desktop */}
      <div className="lg:pt-20 lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-12">
        {/* Header desktop */}
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">{t('yourCart')}</h1>
          <p className="text-neutral-600 mt-1">{items.length} {t('productsInCart')}</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mx-4 lg:mx-0 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="lg:flex lg:gap-8">
          {/* Lista de items */}
          <div className="px-4 lg:px-0 lg:flex-1">
            <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-neutral-200 lg:overflow-hidden">
              {items.map((item, index) => (
                <div key={item.producto.id} className={index !== 0 ? 'lg:border-t lg:border-neutral-200' : ''}>
                  <CartItem item={item} />
                </div>
              ))}
            </div>
          </div>

          {/* Resumen desktop */}
          <div className="hidden lg:block lg:w-96">
            <div className="sticky top-28">
              <CartSummary onEnviarPedido={handleEnviarPedido} enviando={enviando} />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen fijo abajo (mobile) */}
      <div className="fixed bottom-16 left-0 right-0 lg:hidden">
        <CartSummary onEnviarPedido={handleEnviarPedido} enviando={enviando} />
      </div>
    </div>
  )
}
