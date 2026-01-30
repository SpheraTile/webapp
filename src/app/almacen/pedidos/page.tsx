'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Pedido {
  id: string
  numero_pedido: string
  total_m2: number
  total_euros: number
  estado: string
  createdAt: string
  items: Array<{
    id: string
    producto_nombre: string
    cantidad_m2: number
  }>
  user: {
    nombre: string
    empresa: string | null
  }
}

const ESTADOS_PEDIDO = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

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
    year: 'numeric',
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
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[estado] || 'bg-neutral-100 text-neutral-700'}`}>
      {label}
    </span>
  )
}

export default function PedidosPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchPedidos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('busqueda', busqueda)
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado)

      const response = await fetch(`/api/pedidos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPedidos(data.pedidos || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPedidos()
    }, 300)
    return () => clearTimeout(debounce)
  }, [busqueda, filtroEstado])

  const handleCambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        fetchPedidos()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating pedido:', error)
      alert('Error al actualizar pedido')
    }
  }

  const totalFiltrado = pedidos.reduce((sum, p) => sum + p.total_euros, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Pedidos</h1>
          <p className="text-neutral-500 mt-1">Gestión de pedidos de clientes</p>
        </div>
        <Link
          href="/almacen/pedidos/nuevo"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Pedido
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nº pedido, cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro de estado */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos</option>
              {ESTADOS_PEDIDO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0) + estado.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No se encontraron pedidos
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{pedido.numero_pedido}</div>
                      <div className="text-sm text-neutral-500">{pedido.total_m2.toFixed(2)} m²</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-900">{pedido.user.nombre}</div>
                      <div className="text-sm text-neutral-500">{pedido.user.empresa || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-sm">
                      {formatDate(pedido.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-900">{pedido.items.length} productos</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900">{formatCurrency(pedido.total_euros)}</div>
                      <div className="text-xs text-neutral-500">IVA incluido</div>
                    </td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={pedido.estado} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/almacen/pedidos/${pedido.id}`}
                          className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                          title="Ver detalle"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {pedido.estado === 'PENDIENTE' && (
                          <button
                            onClick={() => handleCambiarEstado(pedido.id, 'CONFIRMADO')}
                            className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                            title="Confirmar pedido"
                          >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {pedido.estado === 'CONFIRMADO' && (
                          <button
                            className="p-2 text-neutral-400 hover:text-cyan-600 transition-colors"
                            title="Generar albarán"
                          >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
        <span>Mostrando {pedidos.length} de {total} pedidos</span>
        <span>
          Total: {formatCurrency(totalFiltrado)}
        </span>
      </div>
    </div>
  )
}
