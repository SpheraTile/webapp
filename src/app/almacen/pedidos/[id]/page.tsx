'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShareActions } from '@/components/ui/ShareActions'
import { ProformaDocument } from '@/components/ui/ProformaDocument'
import type { ProformaItem } from '@/components/ui/ProformaDocument'

interface ItemPedido {
  id: string
  producto_nombre: string
  producto_referencia: string
  cantidad_m2: number
  cantidad_cajas: number
  precio_m2: number
  subtotal: number
  producto: {
    slug: string
    imagen: string
    formato?: string
    calidad?: string
    hs_code?: string | null
    cajas_palet?: number | null
    peso_caja_kg?: number | null
  }
}

interface Pedido {
  id: string
  numero_pedido: string
  direccion_envio: string
  ciudad: string
  provincia: string | null
  codigo_postal: string
  notas: string | null
  total_m2: number
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  estado: string
  createdAt: string
  items: ItemPedido[]
  user: {
    id: string
    nombre: string
    email: string
    telefono: string | null
    empresa: string | null
    nif_cif: string | null
    codigo_cliente?: string | null
    pais?: string | null
  }
  albaran: { id: string; numero_albaran: string } | null
  factura: { id: string; numero_factura: string } | null
}

const ESTADOS_PEDIDO = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[estado] || 'bg-neutral-100'}`}>
      {label}
    </span>
  )
}

function mapItemsToProforma(items: ItemPedido[]): ProformaItem[] {
  return items.map((item) => ({
    formato: item.producto?.formato || '-',
    descripcion: `${item.producto_nombre} (Ref: ${item.producto_referencia})`,
    calidad: item.producto?.calidad === 'COM' ? 'COM' : item.producto?.calidad === 'PRIMERA' ? '1ª' : '-',
    m2: item.cantidad_m2,
    cajas: item.cantidad_cajas,
    pallets: item.producto?.cajas_palet ? item.cantidad_cajas / item.producto.cajas_palet : 0,
    precioM2: item.precio_m2,
    importe: item.subtotal,
    qrSlug: item.producto?.slug || null,
    hsCode: item.producto?.hs_code || null,
  }))
}

function calcWeight(items: ItemPedido[]): { net: number; gross: number } {
  const net = items.reduce((sum, item) => {
    return sum + (item.cantidad_cajas * (item.producto?.peso_caja_kg || 25))
  }, 0)
  return { net, gross: Math.ceil(net * 1.02) }
}

export default function PedidoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingAlbaran, setCreatingAlbaran] = useState(false)
  const [creatingFactura, setCreatingFactura] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [editandoPrecios, setEditandoPrecios] = useState(false)
  const [preciosEditados, setPreciosEditados] = useState<Record<string, number>>({})
  const [guardando, setGuardando] = useState(false)

  const fetchPedido = async () => {
    try {
      const response = await fetch(`/api/pedidos/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPedido(data)
      } else {
        router.push('/almacen/pedidos')
      }
    } catch (error) {
      console.error('Error fetching pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPedido()
  }, [params.id])

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!pedido) return
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (response.ok) {
        fetchPedido()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCrearAlbaran = async () => {
    if (!pedido || pedido.albaran) return
    setCreatingAlbaran(true)
    try {
      const response = await fetch('/api/albaranes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.id,
          direccion_entrega: `${pedido.direccion_envio}, ${pedido.codigo_postal} ${pedido.ciudad}`,
          total_m2: pedido.total_m2,
          total_cajas: pedido.items.reduce((sum, item) => sum + item.cantidad_cajas, 0),
          peso_total_kg: pedido.items.reduce((sum, item) => sum + item.cantidad_cajas * 20, 0),
        }),
      })
      if (response.ok) {
        const albaran = await response.json()
        router.push(`/almacen/albaranes/${albaran.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear albarán')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear albarán')
    } finally {
      setCreatingAlbaran(false)
    }
  }

  const handleCrearFactura = async () => {
    if (!pedido || pedido.factura) return
    setCreatingFactura(true)
    try {
      const fechaVencimiento = new Date()
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)

      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.id,
          direccion_facturacion: `${pedido.direccion_envio}, ${pedido.codigo_postal} ${pedido.ciudad}`,
          subtotal_euros: pedido.subtotal_euros,
          iva_porcentaje: pedido.iva_porcentaje,
          iva_euros: pedido.iva_euros,
          total_euros: pedido.total_euros,
          fecha_vencimiento: fechaVencimiento.toISOString(),
        }),
      })
      if (response.ok) {
        const factura = await response.json()
        router.push(`/almacen/facturas/${factura.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear factura')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear factura')
    } finally {
      setCreatingFactura(false)
    }
  }

  const iniciarEdicionPrecios = () => {
    if (!pedido) return
    const precios: Record<string, number> = {}
    pedido.items.forEach((item) => {
      precios[item.id] = item.precio_m2
    })
    setPreciosEditados(precios)
    setEditandoPrecios(true)
  }

  const cancelarEdicionPrecios = () => {
    setEditandoPrecios(false)
    setPreciosEditados({})
  }

  const handlePrecioChange = (itemId: string, nuevoPrecio: number) => {
    setPreciosEditados((prev) => ({
      ...prev,
      [itemId]: nuevoPrecio,
    }))
  }

  const calcularSubtotalTemp = (item: ItemPedido) => {
    const precio = preciosEditados[item.id] ?? item.precio_m2
    return item.cantidad_m2 * precio
  }

  const calcularTotalesTemp = () => {
    if (!pedido) return { subtotal: 0, iva: 0, total: 0 }
    const subtotal = pedido.items.reduce((sum, item) => sum + calcularSubtotalTemp(item), 0)
    const iva = subtotal * (pedido.iva_porcentaje / 100)
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const guardarPrecios = async () => {
    if (!pedido) return
    setGuardando(true)
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/precios`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precios: preciosEditados }),
      })

      if (response.ok) {
        await fetchPedido()
        setEditandoPrecios(false)
        setPreciosEditados({})
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar precios')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar precios')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminarPedido = async () => {
    if (!pedido || deleteConfirmText !== 'BORRAR') return
    setDeleting(true)
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/almacen/pedidos')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar pedido')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar pedido')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
      setDeleteConfirmText('')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">Pedido no encontrado</p>
      </div>
    )
  }

  const proformaItems = mapItemsToProforma(pedido.items)
  const weight = calcWeight(pedido.items)

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8 print:hidden">
        <div>
          <Link href="/almacen/pedidos" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a pedidos
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">{pedido.numero_pedido}</h1>
          <p className="text-neutral-500 mt-1 text-sm lg:text-base">{formatDate(pedido.createdAt)}</p>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      {/* Acciones de compartir */}
      <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 mb-4 lg:mb-6 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <ShareActions
            documentNumber={pedido.numero_pedido}
            documentType="pedido"
            clientEmail={pedido.user.email}
            clientPhone={pedido.user.telefono || undefined}
            printRef={printRef}
          />

          {/* Selector de estado */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 hidden sm:inline">Cambiar estado:</span>
            <select
              value={pedido.estado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              className="flex-1 sm:flex-initial border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {ESTADOS_PEDIDO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0) + estado.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Editar precios (fuera del PDF) */}
      {editandoPrecios && (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-4 lg:mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-900">Editar precios</h3>
            <div className="flex items-center gap-2">
              <button onClick={cancelarEdicionPrecios} className="px-3 py-1 text-sm text-neutral-600 hover:text-neutral-800" disabled={guardando}>
                Cancelar
              </button>
              <button onClick={guardarPrecios} disabled={guardando} className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {pedido.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-2 bg-neutral-50 rounded">
                <span className="text-sm text-neutral-900 truncate flex-1">{item.producto_nombre}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preciosEditados[item.id] ?? item.precio_m2}
                    onChange={(e) => handlePrecioChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-neutral-300 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-500">€/m²</span>
                </div>
                <span className="text-sm font-medium w-24 text-right">
                  {formatCurrency(calcularSubtotalTemp(item))}€
                </span>
              </div>
            ))}
            {(() => {
              const totales = calcularTotalesTemp()
              return (
                <div className="pt-2 border-t border-neutral-200 space-y-1">
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-neutral-500">Subtotal:</span>
                    <span className="font-medium text-amber-600 w-24 text-right">{formatCurrency(totales.subtotal)}€</span>
                  </div>
                  <div className="flex justify-end gap-4 text-sm">
                    <span className="text-neutral-500">IVA ({pedido.iva_porcentaje}%):</span>
                    <span className="font-medium text-amber-600 w-24 text-right">{formatCurrency(totales.iva)}€</span>
                  </div>
                  <div className="flex justify-end gap-4 text-sm font-bold">
                    <span>Total:</span>
                    <span className="text-amber-600 w-24 text-right">{formatCurrency(totales.total)}€</span>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {!editandoPrecios && !pedido.factura && (
        <div className="mb-4 print:hidden">
          <button onClick={iniciarEdicionPrecios} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Editar precios
          </button>
        </div>
      )}

      {/* Documento imprimible (PDF) */}
      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
        <ProformaDocument
          type="PEDIDO"
          documentNumber={pedido.numero_pedido}
          date={pedido.createdAt}
          client={{
            codigo: pedido.user.codigo_cliente,
            nombre: pedido.user.nombre,
            empresa: pedido.user.empresa,
            pais: pedido.user.pais,
            nif: pedido.user.nif_cif,
            telefono: pedido.user.telefono,
            direccion: `${pedido.direccion_envio}, ${pedido.codigo_postal} ${pedido.ciudad}`,
          }}
          items={proformaItems}
          totals={{
            totalM2: proformaItems.reduce((s, i) => s + i.m2, 0),
            totalCajas: proformaItems.reduce((s, i) => s + i.cajas, 0),
            totalPallets: proformaItems.reduce((s, i) => s + i.pallets, 0),
            subtotal: pedido.subtotal_euros,
            ivaPorcentaje: pedido.iva_porcentaje,
            ivaEuros: pedido.iva_euros,
            total: pedido.total_euros,
          }}
          weight={weight}
          observations={pedido.notas || 'MERCANCIA DE ORIGEN ESPAÑOL'}
        />
      </div>

      {/* Documentos relacionados */}
      <div className="mt-4 bg-white rounded-xl shadow-sm p-4 lg:p-6 print:hidden">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Documentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Albarán */}
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">Albarán</h3>
                {pedido.albaran ? (
                  <p className="text-sm text-neutral-500">{pedido.albaran.numero_albaran}</p>
                ) : (
                  <p className="text-sm text-neutral-500">No generado</p>
                )}
              </div>
              {pedido.albaran ? (
                <Link
                  href={`/almacen/albaranes/${pedido.albaran.id}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Ver albarán
                </Link>
              ) : (
                <button
                  onClick={handleCrearAlbaran}
                  disabled={creatingAlbaran || pedido.estado === 'PENDIENTE' || pedido.estado === 'CANCELADO'}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingAlbaran ? 'Creando...' : 'Generar albarán'}
                </button>
              )}
            </div>
          </div>

          {/* Factura */}
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">Factura</h3>
                {pedido.factura ? (
                  <p className="text-sm text-neutral-500">{pedido.factura.numero_factura}</p>
                ) : (
                  <p className="text-sm text-neutral-500">No generada</p>
                )}
              </div>
              {pedido.factura ? (
                <Link
                  href={`/almacen/facturas/${pedido.factura.id}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Ver factura
                </Link>
              ) : (
                <button
                  onClick={handleCrearFactura}
                  disabled={creatingFactura || pedido.estado === 'PENDIENTE' || pedido.estado === 'CANCELADO'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingFactura ? 'Creando...' : 'Generar factura'}
                </button>
              )}
            </div>
          </div>
        </div>
        {(pedido.estado === 'PENDIENTE' || pedido.estado === 'CANCELADO') && (
          <p className="text-sm text-amber-600 mt-4">
            * Para generar albarán o factura, el pedido debe estar confirmado o en proceso.
          </p>
        )}
      </div>

      {/* Zona de peligro - Eliminar pedido */}
      {!pedido.albaran && !pedido.factura && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6 print:hidden">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Zona de peligro</h2>
          <p className="text-sm text-red-600 mb-4">
            Una vez eliminado, el pedido no se puede recuperar. Esta acción es irreversible.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Eliminar pedido
          </button>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">¿Eliminar pedido?</h3>
                <p className="text-sm text-neutral-500">{pedido.numero_pedido}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Esta acción eliminará permanentemente el pedido y todos sus datos asociados. No se puede deshacer.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Para confirmar, escribe <span className="font-bold text-red-600">BORRAR</span> en el campo de abajo:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Escribe BORRAR para confirmar"
                className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarPedido}
                disabled={deleteConfirmText !== 'BORRAR' || deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Eliminando...' : 'Eliminar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
