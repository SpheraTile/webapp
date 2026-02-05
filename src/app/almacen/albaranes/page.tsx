'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Albaran {
  id: string
  numero_albaran: string
  direccion_entrega: string
  total_m2: number
  total_cajas: number
  peso_total_kg: number
  estado: string
  notas: string | null
  transportista: string | null
  matricula: string | null
  fecha_entrega: string | null
  createdAt: string
  pedido: {
    numero_pedido: string
    user: {
      nombre: string
      empresa: string | null
    }
  }
}

const ESTADOS_ALBARAN = ['BORRADOR', 'EMITIDO', 'ENTREGADO', 'ANULADO']

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    BORRADOR: 'bg-neutral-100 text-neutral-700',
    EMITIDO: 'bg-blue-100 text-blue-700',
    ENTREGADO: 'bg-green-100 text-green-700',
    ANULADO: 'bg-red-100 text-red-700',
  }

  const label = estado.charAt(0) + estado.slice(1).toLowerCase()

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[estado] || 'bg-neutral-100 text-neutral-700'}`}>
      {label}
    </span>
  )
}

export default function AlbaranesPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [albaranes, setAlbaranes] = useState<Albaran[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAlbaranes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroEstado !== 'todos') params.set('estado', filtroEstado)

      const response = await fetch(`/api/albaranes?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAlbaranes(data.albaranes || [])
      }
    } catch (error) {
      console.error('Error fetching albaranes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbaranes()
  }, [filtroEstado])

  const handleCambiarEstado = async (albaranId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/albaranes/${albaranId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        fetchAlbaranes()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating albaran:', error)
      alert('Error al actualizar albarán')
    }
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Albaranes</h1>
          <p className="text-neutral-500 mt-1 text-sm lg:text-base">Notas de entrega y envíos</p>
        </div>
        <Link
          href="/almacen/albaranes/nuevo"
          className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm lg:text-base"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Albarán
        </Link>
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
            {ESTADOS_ALBARAN.map((estado) => (
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
      ) : albaranes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-neutral-500">
          No se encontraron albaranes
        </div>
      ) : (
        <>
          {/* Mobile view - card layout */}
          <div className="lg:hidden space-y-3">
            {albaranes.map((albaran) => (
              <Link
                key={albaran.id}
                href={`/almacen/albaranes/${albaran.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-neutral-900">{albaran.numero_albaran}</p>
                    <p className="text-sm text-neutral-500">{albaran.pedido.numero_pedido}</p>
                  </div>
                  <EstadoBadge estado={albaran.estado} />
                </div>
                <div className="mb-2">
                  <p className="text-sm text-neutral-900">{albaran.pedido.user.nombre}</p>
                  <p className="text-xs text-neutral-500 truncate">{albaran.direccion_entrega}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <span className="text-neutral-500">{formatDate(albaran.createdAt)}</span>
                  <span className="font-medium text-primary-600">{albaran.total_m2.toFixed(2)} m² • {albaran.total_cajas} cajas</span>
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
                      Nº Albarán
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Fecha Emisión
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Mercancía
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
                  {albaranes.map((albaran) => (
                    <tr key={albaran.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        <Link href={`/almacen/albaranes/${albaran.id}`} className="hover:text-primary-600">
                          {albaran.numero_albaran}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {albaran.pedido.numero_pedido}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-900">{albaran.pedido.user.nombre}</div>
                        <div className="text-sm text-neutral-500 truncate max-w-[200px]">
                          {albaran.direccion_entrega}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">
                        {formatDate(albaran.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-900">{albaran.total_m2.toFixed(2)} m²</div>
                        <div className="text-sm text-neutral-500">{albaran.total_cajas} cajas</div>
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge estado={albaran.estado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/almacen/albaranes/${albaran.id}`}
                            className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                            title="Ver detalles"
                          >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {albaran.estado === 'BORRADOR' && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleCambiarEstado(albaran.id, 'EMITIDO') }}
                              className="p-2 text-neutral-400 hover:text-blue-600 transition-colors"
                              title="Emitir albarán"
                            >
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          {albaran.estado === 'EMITIDO' && (
                            <button
                              onClick={(e) => { e.preventDefault(); handleCambiarEstado(albaran.id, 'ENTREGADO') }}
                              className="p-2 text-neutral-400 hover:text-green-600 transition-colors"
                              title="Marcar como entregado"
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
        Mostrando {albaranes.length} albaranes
      </div>
    </div>
  )
}
