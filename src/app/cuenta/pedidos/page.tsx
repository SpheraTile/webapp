'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconPackage, IconCalendar, IconEye } from '@/components/ui/Icons'

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
  total_m2: number
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

export default function MisPedidosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchPedidos() {
      if (session?.user) {
        try {
          const params = new URLSearchParams()
          if (filtroEstado !== 'todos') {
            params.set('estado', filtroEstado)
          }
          const res = await fetch(`/api/mis-pedidos?${params.toString()}`)
          if (res.ok) {
            const data = await res.json()
            setPedidos(data.pedidos || [])
          }
        } catch (error) {
          console.error('Error fetching pedidos:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchPedidos()
    }
  }, [session, filtroEstado])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Mis Pedidos" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Mis Pedidos</h1>
            <p className="text-neutral-500 mt-1">{pedidos.length} pedidos realizados</p>
          </div>
          <Link
            href="/cuenta"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

        {/* Filtros de estado */}
        <div className="p-4 lg:p-0 lg:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {['todos', 'PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filtroEstado === estado
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {estado === 'todos' ? 'Todos' : ESTADOS_LABELS[estado]?.label || estado}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="lg:space-y-4">
          {pedidos.length === 0 ? (
            <div className="text-center py-16 px-4">
              <IconPackage size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500 mb-4">No tienes pedidos todavía</p>
              <Link
                href="/productos"
                className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            pedidos.map((pedido) => (
              <PedidoCard key={pedido.id} pedido={pedido} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const estado = ESTADOS_LABELS[pedido.estado] || { label: pedido.estado, color: 'bg-neutral-100 text-neutral-800' }
  const fecha = new Date(pedido.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white border-b border-neutral-100 lg:border lg:border-neutral-200 lg:rounded-2xl lg:shadow-sm overflow-hidden">
      {/* Cabecera del pedido */}
      <div className="p-4 lg:p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-neutral-900">{pedido.numero_pedido}</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
              <IconCalendar size={14} />
              <span>{fecha}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color}`}>
            {estado.label}
          </span>
        </div>

        {/* Preview de productos */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {pedido.items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="w-16 h-16 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden"
            >
              {item.producto?.imagen ? (
                <img
                  src={item.producto.imagen}
                  alt={item.producto_nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <IconPackage size={24} />
                </div>
              )}
            </div>
          ))}
          {pedido.items.length > 4 && (
            <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 text-sm font-medium">
              +{pedido.items.length - 4}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <div className="text-sm text-neutral-500">
            {pedido.items.length} productos · {pedido.total_m2.toFixed(2)} m²
          </div>
          <div className="font-semibold text-neutral-900">
            {pedido.total_euros.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-4 py-3 lg:px-6 lg:py-4 bg-neutral-50 border-t border-neutral-100">
        <Link
          href={`/cuenta/pedidos/${pedido.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
        >
          <IconEye size={18} />
          Ver detalle
        </Link>
      </div>
    </div>
  )
}
