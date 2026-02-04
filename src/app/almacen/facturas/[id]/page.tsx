'use client'

import { useState, useEffect, useRef } from 'react'
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
    id: string
    numero_pedido: string
    items: ItemPedido[]
    user: {
      nombre: string
      email: string
      telefono: string | null
      empresa: string | null
      nif_cif: string | null
      direccion: string | null
      ciudad: string | null
      provincia: string | null
      codigo_postal: string | null
    }
  }
}

const ESTADOS_FACTURA = ['BORRADOR', 'EMITIDA', 'PAGADA', 'VENCIDA', 'ANULADA']
const METODOS_PAGO: Record<string, string> = {
  TRANSFERENCIA: 'Transferencia bancaria',
  TARJETA: 'Tarjeta de crédito/débito',
  EFECTIVO: 'Efectivo',
  PAGARE: 'Pagaré',
  DOMICILIACION: 'Domiciliación bancaria',
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[estado] || 'bg-neutral-100'}`}>
      {label}
    </span>
  )
}

export default function FacturaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchFactura = async () => {
    try {
      const response = await fetch(`/api/facturas/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setFactura(data)
      } else {
        router.push('/almacen/facturas')
      }
    } catch (error) {
      console.error('Error fetching factura:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFactura()
  }, [params.id])

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!factura) return
    try {
      const response = await fetch(`/api/facturas/${factura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (response.ok) {
        fetchFactura()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleMarcarPagada = async () => {
    if (!factura) return
    try {
      const response = await fetch(`/api/facturas/${factura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'PAGADA',
          fecha_pago: new Date().toISOString(),
        }),
      })
      if (response.ok) {
        fetchFactura()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al marcar como pagada')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!factura) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">Factura no encontrada</p>
      </div>
    )
  }

  const diasHastaVencimiento = Math.ceil(
    (new Date(factura.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header - hidden when printing */}
      <div className="flex items-start justify-between mb-8 print:hidden">
        <div>
          <Link href="/almacen/facturas" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a facturas
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">Factura {factura.numero_factura}</h1>
          <p className="text-neutral-500 mt-1">Emitida: {formatDate(factura.createdAt)}</p>
        </div>
        <EstadoBadge estado={factura.estado} />
      </div>

      {/* Acciones de compartir */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ShareActions
            title="Factura"
            documentNumber={factura.numero_factura}
            documentType="factura"
            clientEmail={factura.pedido.user.email}
            clientPhone={factura.pedido.user.telefono || undefined}
          />

          <div className="flex items-center gap-4">
            {/* Botón marcar como pagada */}
            {factura.estado === 'EMITIDA' && (
              <button
                onClick={handleMarcarPagada}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Marcar como pagada
              </button>
            )}

            {/* Selector de estado */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">Estado:</span>
              <select
                value={factura.estado}
                onChange={(e) => handleCambiarEstado(e.target.value)}
                className="border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {ESTADOS_FACTURA.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0) + estado.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de vencimiento */}
      {factura.estado === 'EMITIDA' && diasHastaVencimiento <= 7 && (
        <div className={`p-4 rounded-lg mb-6 print:hidden ${diasHastaVencimiento < 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
          {diasHastaVencimiento < 0 ? (
            <p className="font-medium">Esta factura está vencida hace {Math.abs(diasHastaVencimiento)} días</p>
          ) : diasHastaVencimiento === 0 ? (
            <p className="font-medium">Esta factura vence hoy</p>
          ) : (
            <p className="font-medium">Esta factura vence en {diasHastaVencimiento} días</p>
          )}
        </div>
      )}

      {/* Documento imprimible */}
      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
        {/* Cabecera del documento */}
        <div className="p-6 border-b border-neutral-200 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">FACTURA</h2>
              <p className="text-lg font-medium text-primary-600">{factura.numero_factura}</p>
              <div className="mt-2 text-sm">
                <p><span className="text-neutral-500">Fecha emisión:</span> {formatDate(factura.createdAt)}</p>
                <p><span className="text-neutral-500">Fecha vencimiento:</span> {formatDate(factura.fecha_vencimiento)}</p>
                {factura.fecha_pago && (
                  <p><span className="text-neutral-500">Fecha pago:</span> {formatDate(factura.fecha_pago)}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">SPHERA TILE S.L.</p>
              <p className="text-sm text-neutral-500">CIF: B12345678</p>
              <p className="text-sm text-neutral-500">Pol. Industrial Norte, Nave 15</p>
              <p className="text-sm text-neutral-500">12200 Onda, Castellón</p>
              <p className="text-sm text-neutral-500">Tel: +34 964 123 456</p>
              <p className="text-sm text-neutral-500">info@spheratile.com</p>
            </div>
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">DATOS DEL CLIENTE</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-neutral-900">{factura.pedido.user.nombre}</p>
              {factura.pedido.user.empresa && (
                <p className="text-neutral-700">{factura.pedido.user.empresa}</p>
              )}
              {factura.pedido.user.nif_cif && (
                <p className="text-neutral-700">NIF/CIF: {factura.pedido.user.nif_cif}</p>
              )}
            </div>
            <div>
              <p className="text-neutral-700 whitespace-pre-line">{factura.direccion_facturacion}</p>
              <p className="text-neutral-500 mt-2">{factura.pedido.user.email}</p>
              {factura.pedido.user.telefono && (
                <p className="text-neutral-500">Tel: {factura.pedido.user.telefono}</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalle de la factura */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">DETALLE</h3>
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Descripción</th>
                <th className="text-center px-4 py-2 text-xs font-medium text-neutral-500 uppercase print:hidden">QR</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Cantidad</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Precio unit.</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {factura.pedido.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.producto?.imagen && (
                        <img
                          src={item.producto.imagen}
                          alt={item.producto_nombre}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium text-neutral-900">{item.producto_nombre}</p>
                        <p className="text-sm text-neutral-500">Ref: {item.producto_referencia}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center print:hidden">
                    {item.producto?.slug && (
                      <ProductQRCode productSlug={item.producto.slug} size={56} expandable />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {item.cantidad_m2.toFixed(2)} m²
                    <span className="block text-sm text-neutral-500">({item.cantidad_cajas} cajas)</span>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-900">
                    {formatCurrency(item.precio_m2)}€/m²
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {formatCurrency(item.subtotal)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="mt-6 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-neutral-200">
                <span className="text-neutral-500">Base imponible</span>
                <span className="text-neutral-900">{formatCurrency(factura.subtotal_euros)}€</span>
              </div>
              <div className="flex justify-between py-2 border-b border-neutral-200">
                <span className="text-neutral-500">IVA ({factura.iva_porcentaje}%)</span>
                <span className="text-neutral-900">{formatCurrency(factura.iva_euros)}€</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-lg">
                <span>TOTAL</span>
                <span>{formatCurrency(factura.total_euros)}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de pago */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">FORMA DE PAGO</h3>
          <p className="text-neutral-900">{METODOS_PAGO[factura.metodo_pago] || factura.metodo_pago}</p>
          {factura.metodo_pago === 'TRANSFERENCIA' && (
            <div className="mt-3 p-3 bg-white rounded border border-neutral-200">
              <p className="text-sm text-neutral-500">Datos bancarios:</p>
              <p className="font-mono text-neutral-900">ES12 3456 7890 1234 5678 9012</p>
              <p className="text-sm text-neutral-500 mt-1">Concepto: {factura.numero_factura}</p>
            </div>
          )}
          {factura.notas && (
            <div className="mt-4">
              <p className="text-sm text-neutral-500">Notas:</p>
              <p className="text-neutral-700">{factura.notas}</p>
            </div>
          )}
        </div>

        {/* Pie de página legal */}
        <div className="p-6 border-t border-neutral-200 text-xs text-neutral-500 text-center">
          <p>SPHERA TILE S.L. - CIF: B12345678 - Inscrita en el Registro Mercantil de Castellón</p>
          <p>Tomo 1234, Libro 567, Folio 89, Sección 8, Hoja CS-12345</p>
        </div>

        {/* Pedido relacionado */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Pedido relacionado</p>
              <p className="font-medium text-neutral-900">{factura.pedido.numero_pedido}</p>
            </div>
            <Link
              href={`/almacen/pedidos/${factura.pedido.id}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              Ver pedido
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
