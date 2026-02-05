'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bot } from 'lucide-react'

interface PedidoPendiente {
  id: string
  numero_pedido: string
  total_m2: number
  total_euros: number
  estado: string
  createdAt: string
  user: {
    nombre: string
    empresa: string | null
  }
}

// Formatear moneda
function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  })
}

// Formatear fecha
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Badge de estado
function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    PENDIENTE: 'bg-amber-100 text-amber-700',
    CONFIRMADO: 'bg-blue-100 text-blue-700',
    PREPARANDO: 'bg-purple-100 text-purple-700',
    ENVIADO: 'bg-cyan-100 text-cyan-700',
    ENTREGADO: 'bg-green-100 text-green-700',
    CANCELADO: 'bg-red-100 text-red-700',
  }

  const label = estado.charAt(0) + estado.slice(1).toLowerCase()

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[estado] || 'bg-neutral-100 text-neutral-700'}`}>
      {label}
    </span>
  )
}

export default function AlmacenDashboard() {
  const [pedidosPendientes, setPedidosPendientes] = useState<PedidoPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [savingChat, setSavingChat] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending orders
        const ordersResponse = await fetch('/api/pedidos?estado=PENDIENTE,CONFIRMADO,PREPARANDO&limit=10')
        if (ordersResponse.ok) {
          const data = await ordersResponse.json()
          setPedidosPendientes(data.pedidos || [])
        }

        // Fetch chat enabled setting
        const chatResponse = await fetch('/api/configuracion?clave=chat_enabled')
        if (chatResponse.ok) {
          const chatData = await chatResponse.json()
          setChatEnabled(chatData.valor === null || chatData.valor === 'true')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleChatEnabled = async () => {
    setSavingChat(true)
    const newValue = !chatEnabled

    try {
      const response = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clave: 'chat_enabled',
          valor: newValue.toString(),
          tipo: 'boolean',
          descripcion: 'Habilitar o deshabilitar el asistente IA',
        }),
      })

      if (response.ok) {
        setChatEnabled(newValue)
      }
    } catch (error) {
      console.error('Error saving chat setting:', error)
    } finally {
      setSavingChat(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Panel de Control</h1>
        <p className="text-neutral-500 mt-1 text-sm lg:text-base">Gestión del almacén</p>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <Link
          href="/almacen/pedidos"
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2 lg:gap-3"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm lg:text-base">Pedidos</h3>
            <p className="text-xs text-neutral-500 hidden lg:block">Ver todos los pedidos</p>
          </div>
        </Link>
        <Link
          href="/almacen/productos"
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2 lg:gap-3"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm lg:text-base">Productos</h3>
            <p className="text-xs text-neutral-500 hidden lg:block">Gestionar catálogo</p>
          </div>
        </Link>
        <Link
          href="/almacen/usuarios"
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2 lg:gap-3"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm lg:text-base">Usuarios</h3>
            <p className="text-xs text-neutral-500 hidden lg:block">Gestionar clientes</p>
          </div>
        </Link>
        <Link
          href="/almacen/pedidos/nuevo"
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-2 lg:gap-3"
        >
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm lg:text-base">Nuevo Pedido</h3>
            <p className="text-xs text-neutral-500 hidden lg:block">Crear manualmente</p>
          </div>
        </Link>
      </div>

      {/* Configuración rápida */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6 lg:mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Configuración</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Asistente IA</h3>
              <p className="text-sm text-neutral-500">
                {chatEnabled ? 'Activo en la tienda' : 'Desactivado'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleChatEnabled}
            disabled={savingChat}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              chatEnabled ? 'bg-primary-600' : 'bg-neutral-300'
            } ${savingChat ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                chatEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Pedidos pendientes */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 lg:p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Pedidos Pendientes</h2>
            <p className="text-sm text-neutral-500">{pedidosPendientes.length} pedidos por procesar</p>
          </div>
          <Link
            href="/almacen/pedidos"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>

        {/* Vista móvil - Tarjetas */}
        <div className="lg:hidden divide-y divide-neutral-100">
          {pedidosPendientes.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No hay pedidos pendientes
            </div>
          ) : (
            pedidosPendientes.map((pedido) => (
              <Link
                key={pedido.id}
                href={`/almacen/pedidos/${pedido.id}`}
                className="block p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-neutral-900">{pedido.numero_pedido}</span>
                    <p className="text-sm text-neutral-500">{pedido.user.nombre}</p>
                  </div>
                  <EstadoBadge estado={pedido.estado} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{formatDate(pedido.createdAt)}</span>
                  <span className="font-medium text-neutral-900">{formatCurrency(pedido.total_euros)}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {pedidosPendientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No hay pedidos pendientes
                  </td>
                </tr>
              ) : (
                pedidosPendientes.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{pedido.numero_pedido}</div>
                      <div className="text-sm text-neutral-500">{pedido.total_m2.toFixed(2)} m²</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-900">{pedido.user.nombre}</div>
                      <div className="text-sm text-neutral-500">{pedido.user.empresa || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {formatDate(pedido.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {formatCurrency(pedido.total_euros)}
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={pedido.estado} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/almacen/pedidos/${pedido.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
