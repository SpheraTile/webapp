'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconPackage, IconCalendar, IconMapPin } from '@/components/ui/Icons'

interface ItemPedido {
  id: string
  producto_nombre: string
  producto_referencia: string
  cantidad_m2: number
  cantidad_cajas: number
  precio_m2: number
  subtotal: number
  producto: {
    imagen: string
    slug: string
  }
}

interface Pedido {
  id: string
  numero_pedido: string
  estado: string
  direccion_envio: string
  ciudad: string
  provincia?: string
  codigo_postal: string
  notas?: string
  total_m2: number
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  createdAt: string
  items: ItemPedido[]
}

const ESTADOS_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  PREPARANDO: { label: 'Preparando', color: 'bg-purple-100 text-purple-800' },
  ENVIADO: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
  ENTREGADO: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}

export default function DetallePedidoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchPedido() {
      if (session?.user && params.id) {
        try {
          const res = await fetch(`/api/pedidos/${params.id}`)
          if (res.ok) {
            const data = await res.json()
            setPedido(data)
          } else {
            router.push('/cuenta/pedidos')
          }
        } catch (error) {
          console.error('Error fetching pedido:', error)
          router.push('/cuenta/pedidos')
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchPedido()
    }
  }, [session, params.id, router])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || !pedido) {
    return null
  }

  const estado = ESTADOS_LABELS[pedido.estado] || { label: pedido.estado, color: 'bg-neutral-100 text-neutral-800' }
  const fecha = new Date(pedido.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Detalle del Pedido" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{pedido.numero_pedido}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${estado.color}`}>
                {estado.label}
              </span>
              <span className="text-neutral-500">{fecha}</span>
            </div>
          </div>
          <Link
            href="/cuenta/pedidos"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver a mis pedidos
          </Link>
        </div>

        {/* Info móvil */}
        <div className="lg:hidden p-4 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{pedido.numero_pedido}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color}`}>
              {estado.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
            <IconCalendar size={14} />
            <span>{fecha}</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Productos */}
          <div className="lg:col-span-2">
            <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-neutral-100">
                <h3 className="font-semibold text-neutral-900">Productos ({pedido.items.length})</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {pedido.items.map((item) => (
                  <div key={item.id} className="p-4 lg:p-6 flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden">
                      {item.producto?.imagen ? (
                        <img
                          src={item.producto.imagen}
                          alt={item.producto_nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <IconPackage size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-900 truncate">{item.producto_nombre}</h4>
                      <p className="text-sm text-neutral-500">Ref: {item.producto_referencia}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-neutral-600">{item.cantidad_m2.toFixed(2)} m²</span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-600">{item.cantidad_cajas} cajas</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-neutral-500">{item.precio_m2.toFixed(2)} €/m²</span>
                        <span className="font-semibold text-neutral-900">{item.subtotal.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen y dirección */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* Dirección de envío */}
            <div className="p-4 lg:p-6 lg:bg-white lg:rounded-2xl lg:shadow-sm border-b border-neutral-100 lg:border-none">
              <div className="flex items-center gap-2 mb-3">
                <IconMapPin size={18} className="text-neutral-500" />
                <h3 className="font-semibold text-neutral-900">Dirección de envío</h3>
              </div>
              <p className="text-neutral-600">{pedido.direccion_envio}</p>
              <p className="text-neutral-600">
                {pedido.codigo_postal} {pedido.ciudad}
                {pedido.provincia && `, ${pedido.provincia}`}
              </p>
            </div>

            {/* Notas */}
            {pedido.notas && (
              <div className="p-4 lg:p-6 lg:bg-white lg:rounded-2xl lg:shadow-sm border-b border-neutral-100 lg:border-none">
                <h3 className="font-semibold text-neutral-900 mb-2">Notas</h3>
                <p className="text-neutral-600 text-sm">{pedido.notas}</p>
              </div>
            )}

            {/* Resumen de precios */}
            <div className="p-4 lg:p-6 lg:bg-white lg:rounded-2xl lg:shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total m²</span>
                  <span className="text-neutral-900">{pedido.total_m2.toFixed(2)} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-900">{pedido.subtotal_euros.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">IVA ({pedido.iva_porcentaje}%)</span>
                  <span className="text-neutral-900">{pedido.iva_euros.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-bold text-lg text-neutral-900">{pedido.total_euros.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
