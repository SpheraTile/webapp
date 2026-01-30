'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Estadisticas {
  pedidos_pendientes: number
  pedidos_hoy: number
  facturacion_mes: number
  facturacion_pendiente: number
  productos_bajo_stock: number
  albaranes_pendientes: number
  total_productos: number
  total_clientes: number
}

interface PedidoReciente {
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

// Componente de tarjeta de estadística
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  href,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger'
  href?: string
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
  }

  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
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
  const [stats, setStats] = useState<Estadisticas | null>(null)
  const [pedidosRecientes, setPedidosRecientes] = useState<PedidoReciente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pedidosRes] = await Promise.all([
          fetch('/api/estadisticas'),
          fetch('/api/pedidos?limit=5'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (pedidosRes.ok) {
          const pedidosData = await pedidosRes.json()
          setPedidosRecientes(pedidosData.pedidos || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Resumen de actividad del almacén</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pedidos Pendientes"
          value={stats?.pedidos_pendientes || 0}
          subtitle="Requieren atención"
          color="warning"
          href="/almacen/pedidos?estado=pendiente"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Facturación del Mes"
          value={formatCurrency(stats?.facturacion_mes || 0)}
          color="success"
          href="/almacen/facturas"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pendiente de Cobro"
          value={formatCurrency(stats?.facturacion_pendiente || 0)}
          color="danger"
          href="/almacen/facturas?estado=emitida"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          title="Productos Bajo Stock"
          value={stats?.productos_bajo_stock || 0}
          subtitle="Necesitan reposición"
          color="danger"
          href="/almacen/productos?stock=bajo"
          icon={
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Pedidos Recientes</h2>
            <p className="text-sm text-neutral-500">Últimos pedidos recibidos</p>
          </div>
          <Link
            href="/almacen/pedidos"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
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
              {pedidosRecientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    No hay pedidos recientes
                  </td>
                </tr>
              ) : (
                pedidosRecientes.map((pedido) => (
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

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/almacen/pedidos/nuevo"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Nuevo Pedido</h3>
            <p className="text-sm text-neutral-500">Crear pedido manualmente</p>
          </div>
        </Link>
        <Link
          href="/almacen/albaranes/nuevo"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Generar Albarán</h3>
            <p className="text-sm text-neutral-500">Crear albarán de entrega</p>
          </div>
        </Link>
        <Link
          href="/almacen/facturas/nueva"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">Nueva Factura</h3>
            <p className="text-sm text-neutral-500">Emitir factura</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
