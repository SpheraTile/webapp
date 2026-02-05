'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Factura {
  id: string
  numero_factura: string
  direccion_facturacion: string
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  estado: string
  metodo_pago: string
  notas: string | null
  fecha_vencimiento: string
  fecha_pago: string | null
  createdAt: string
  pedido: {
    numero_pedido: string
    user: {
      nombre: string
      empresa: string | null
      nif_cif: string | null
    }
  }
}

const ESTADOS_FACTURA = ['BORRADOR', 'EMITIDA', 'PAGADA', 'VENCIDA', 'ANULADA']
const METODOS_PAGO: Record<string, string> = {
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  EFECTIVO: 'Efectivo',
  PAGARE: 'Pagaré',
  DOMICILIACION: 'Domiciliación',
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    BORRADOR: 'bg-neutral-100 text-neutral-700',
    EMITIDA: 'bg-blue-100 text-blue-700',
    PAGADA: 'bg-green-100 text-green-700',
    VENCIDA: 'bg-orange-100 text-orange-700',
    ANULADA: 'bg-red-100 text-red-700',
  }

  const label = estado.charAt(0) + estado.slice(1).toLowerCase()

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[estado] || 'bg-neutral-100 text-neutral-700'}`}>
      {label}
    </span>
  )
}

function MetodoPagoBadge({ metodo }: { metodo: string }) {
  return (
    <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs">
      {METODOS_PAGO[metodo] || metodo}
    </span>
  )
}

export default function FacturasPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFacturas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado)

      const response = await fetch(`/api/facturas?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setFacturas(data.facturas || [])
      }
    } catch (error) {
      console.error('Error fetching facturas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacturas()
  }, [filtroEstado])

  const handleCambiarEstado = async (facturaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/facturas/${facturaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        fetchFacturas()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating factura:', error)
      alert('Error al actualizar factura')
    }
  }

  // Calcular totales
  const totalPendiente = facturas
    .filter((f) => f.estado === 'EMITIDA' || f.estado === 'VENCIDA')
    .reduce((sum, f) => sum + f.total_euros, 0)

  const totalPagado = facturas
    .filter((f) => f.estado === 'PAGADA')
    .reduce((sum, f) => sum + f.total_euros, 0)

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Facturas</h1>
          <p className="text-neutral-500 mt-1 text-sm lg:text-base">Gestión de facturación</p>
        </div>
        <Link
          href="/almacen/facturas/nueva"
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm lg:text-base"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Factura
        </Link>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4">
          <div className="text-xs lg:text-sm text-neutral-500 mb-1">Total Facturado</div>
          <div className="text-lg lg:text-2xl font-bold text-neutral-900">
            {formatCurrency(totalPendiente + totalPagado)}€
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4">
          <div className="text-xs lg:text-sm text-neutral-500 mb-1">Pendiente de Cobro</div>
          <div className="text-lg lg:text-2xl font-bold text-orange-600">
            {formatCurrency(totalPendiente)}€
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4">
          <div className="text-xs lg:text-sm text-neutral-500 mb-1">Cobrado</div>
          <div className="text-lg lg:text-2xl font-bold text-green-600">
            {formatCurrency(totalPagado)}€
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 mb-4 lg:mb-6">
        <div className="flex items-center gap-3 lg:gap-4">
          <span className="text-xs lg:text-sm text-neutral-500">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="flex-1 sm:flex-initial border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="todos">Todos</option>
            {ESTADOS_FACTURA.map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0) + estado.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : facturas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-neutral-500">
          No se encontraron facturas
        </div>
      ) : (
        <>
          {/* Mobile view - card layout */}
          <div className="lg:hidden space-y-3">
            {facturas.map((factura) => (
              <Link
                key={factura.id}
                href={`/almacen/facturas/${factura.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{factura.numero_factura}</p>
                    <p className="text-sm text-neutral-500">{factura.pedido.user.nombre}</p>
                  </div>
                  <EstadoBadge estado={factura.estado} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-neutral-500 block">Emisión</span>
                    <span className="font-medium">{formatDate(factura.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Vencimiento</span>
                    <span className="font-medium">{formatDate(factura.fecha_vencimiento)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <MetodoPagoBadge metodo={factura.metodo_pago} />
                  <div className="text-right">
                    <span className="font-bold text-primary-600">{formatCurrency(factura.total_euros)}€</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop view - table layout */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Nº Factura
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Fecha Emisión
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Importe
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Pago
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
                  {facturas.map((factura) => (
                    <tr key={factura.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        <Link href={`/almacen/facturas/${factura.id}`} className="hover:text-primary-600">
                          {factura.numero_factura}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-900">{factura.pedido.user.nombre}</div>
                        <div className="text-sm text-neutral-500">{factura.pedido.user.nif_cif || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {formatDate(factura.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {formatDate(factura.fecha_vencimiento)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-neutral-900">
                          {formatCurrency(factura.total_euros)}€
                        </div>
                        <div className="text-sm text-neutral-500">
                          Base: {formatCurrency(factura.subtotal_euros)}€
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <MetodoPagoBadge metodo={factura.metodo_pago} />
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge estado={factura.estado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/almacen/facturas/${factura.id}`}
                            className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                            title="Ver detalles"
                          >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {factura.estado === 'BORRADOR' && (
                            <button
                              onClick={() => handleCambiarEstado(factura.id, 'EMITIDA')}
                              className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                              title="Emitir factura"
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          {factura.estado === 'EMITIDA' && (
                            <button
                              onClick={() => handleCambiarEstado(factura.id, 'PAGADA')}
                              className="p-2 text-neutral-400 hover:text-green-600 transition-colors"
                              title="Marcar como pagada"
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Resumen */}
      <div className="mt-4 lg:mt-6 text-xs lg:text-sm text-neutral-500">
        Mostrando {facturas.length} facturas
      </div>
    </div>
  )
}
