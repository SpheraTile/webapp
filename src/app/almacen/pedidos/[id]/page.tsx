'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShareActions } from '@/components/ui/ShareActions'
import { ProductQRCode } from '@/components/ui/QRCode'

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

export default function PedidoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingAlbaran, setCreatingAlbaran] = useState(false)
  const [creatingFactura, setCreatingFactura] = useState(false)

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
          peso_total_kg: pedido.items.reduce((sum, item) => sum + item.cantidad_cajas * 20, 0), // Estimado 20kg/caja
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
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30) // Vencimiento a 30 días

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/almacen/pedidos" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a pedidos
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">{pedido.numero_pedido}</h1>
          <p className="text-neutral-500 mt-1">{formatDate(pedido.createdAt)}</p>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>

      {/* Acciones de compartir */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ShareActions
            title="Pedido"
            documentNumber={pedido.numero_pedido}
            documentType="pedido"
            clientEmail={pedido.user.email}
            clientPhone={pedido.user.telefono || undefined}
          />

          {/* Selector de estado */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Cambiar estado:</span>
            <select
              value={pedido.estado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

      {/* Datos del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Datos del Cliente</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-neutral-500">Nombre</dt>
              <dd className="text-neutral-900 font-medium">{pedido.user.nombre}</dd>
            </div>
            {pedido.user.empresa && (
              <div>
                <dt className="text-sm text-neutral-500">Empresa</dt>
                <dd className="text-neutral-900">{pedido.user.empresa}</dd>
              </div>
            )}
            {pedido.user.nif_cif && (
              <div>
                <dt className="text-sm text-neutral-500">NIF/CIF</dt>
                <dd className="text-neutral-900">{pedido.user.nif_cif}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-neutral-500">Email</dt>
              <dd className="text-neutral-900">{pedido.user.email}</dd>
            </div>
            {pedido.user.telefono && (
              <div>
                <dt className="text-sm text-neutral-500">Teléfono</dt>
                <dd className="text-neutral-900">{pedido.user.telefono}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Dirección de Envío</h2>
          <address className="not-italic text-neutral-700">
            {pedido.direccion_envio}<br />
            {pedido.codigo_postal} {pedido.ciudad}<br />
            {pedido.provincia}
          </address>
          {pedido.notas && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <dt className="text-sm text-neutral-500 mb-1">Notas</dt>
              <dd className="text-neutral-700">{pedido.notas}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Producto</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-neutral-500 uppercase print:hidden">QR</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Cantidad</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Precio/m²</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {pedido.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.producto?.imagen && (
                        <img
                          src={item.producto.imagen}
                          alt={item.producto_nombre}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="font-medium text-neutral-900">{item.producto_nombre}</div>
                        <div className="text-sm text-neutral-500">{item.producto_referencia}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center print:hidden">
                    {item.producto?.slug && (
                      <ProductQRCode productSlug={item.producto.slug} size={64} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-neutral-900">{item.cantidad_m2.toFixed(2)} m²</div>
                    <div className="text-sm text-neutral-500">{item.cantidad_cajas} cajas</div>
                  </td>
                  <td className="px-6 py-4 text-right text-neutral-900">
                    {formatCurrency(item.precio_m2)}€
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-neutral-900">
                    {formatCurrency(item.subtotal)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-200">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-neutral-900">{formatCurrency(pedido.subtotal_euros)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">IVA ({pedido.iva_porcentaje}%)</span>
              <span className="text-neutral-900">{formatCurrency(pedido.iva_euros)}€</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="font-bold text-xl text-neutral-900">{formatCurrency(pedido.total_euros)}€</span>
            </div>
            <div className="text-right text-sm text-neutral-500">
              Total: {pedido.total_m2.toFixed(2)} m²
            </div>
          </div>
        </div>
      </div>

      {/* Documentos relacionados */}
      <div className="bg-white rounded-xl shadow-sm p-6 print:hidden">
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
    </div>
  )
}
