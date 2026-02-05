'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { ProductQRCode } from '@/components/ui/QRCode'
import { downloadPDF } from '@/lib/pdf'

interface ItemFactura {
  id: string
  producto_nombre: string
  producto_referencia: string
  producto_slug: string | null
  producto_imagen: string | null
  cantidad_m2: number
  cantidad_cajas: number
  precio_m2: number
  subtotal: number
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
  fecha_vencimiento: string
  fecha_pago: string | null
  createdAt: string
  items: ItemFactura[]
  pedido: {
    id: string
    numero_pedido: string
  }
}

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
    EMITIDA: 'bg-amber-100 text-amber-700',
    PAGADA: 'bg-green-100 text-green-700',
    VENCIDA: 'bg-red-100 text-red-700',
    ANULADA: 'bg-neutral-100 text-neutral-700',
  }

  const labels: Record<string, string> = {
    EMITIDA: 'Pendiente',
    PAGADA: 'Pagada',
    VENCIDA: 'Vencida',
    ANULADA: 'Anulada',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium print:hidden ${colors[estado] || 'bg-neutral-100'}`}>
      {labels[estado] || estado}
    </span>
  )
}

export default function MiFacturaDetallePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchFactura() {
      if (session?.user && params.id) {
        try {
          const response = await fetch(`/api/mis-facturas/${params.id}`)
          if (response.ok) {
            const data = await response.json()
            setFactura(data)
          } else {
            router.push('/cuenta/facturas')
          }
        } catch (error) {
          console.error('Error fetching factura:', error)
          router.push('/cuenta/facturas')
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchFactura()
    }
  }, [session, params.id, router])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current || !factura) return

    setGeneratingPDF(true)
    try {
      await downloadPDF({
        filename: `Factura_${factura.numero_factura}`,
        element: printRef.current as HTMLElement,
        orientation: 'portrait',
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar el PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || !factura) {
    return null
  }

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50 print:bg-white">
      <div className="print:hidden">
        <DesktopNav />
        <div className="lg:hidden">
          <Header titulo={`Factura ${factura.numero_factura}`} showBack />
        </div>
      </div>

      <div className="lg:pt-20 lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-12 print:pt-0 print:max-w-none print:px-0 print:py-0">
        {/* Header desktop */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8 print:hidden">
          <div>
            <Link href="/cuenta/facturas" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
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

        {/* Actions */}
        <div className="p-4 lg:p-0 lg:mb-6 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {generatingPDF ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-initial flex items-center justify-center gap-2 py-3 px-6 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors font-medium"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
          </div>
        </div>

        {/* Documento imprimible */}
        <div ref={printRef} className="bg-white lg:rounded-xl lg:shadow-sm overflow-hidden print:shadow-none print:rounded-none">
          {/* Cabecera del documento */}
          <div className="p-4 lg:p-6 border-b border-neutral-200 print:border-black">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">FACTURA</h2>
                <p className="text-base lg:text-lg font-medium text-primary-600">{factura.numero_factura}</p>
                <div className="mt-2 text-xs lg:text-sm">
                  <p><span className="text-neutral-500">Fecha emisión:</span> {formatDate(factura.createdAt)}</p>
                  <p><span className="text-neutral-500">Fecha vencimiento:</span> {formatDate(factura.fecha_vencimiento)}</p>
                  {factura.fecha_pago && (
                    <p><span className="text-neutral-500">Fecha pago:</span> {formatDate(factura.fecha_pago)}</p>
                  )}
                </div>
              </div>
              <div className="sm:text-right">
                <p className="font-bold text-base lg:text-lg">SPHERA TILE S.L.</p>
                <p className="text-xs lg:text-sm text-neutral-500">CIF: B12345678</p>
                <p className="text-xs lg:text-sm text-neutral-500">Av. Del Mediterráneo 113</p>
                <p className="text-xs lg:text-sm text-neutral-500">12200 Onda, Castellón</p>
                <p className="text-xs lg:text-sm text-neutral-500">Tel: +34 633 909 095</p>
                <p className="text-xs lg:text-sm text-neutral-500">info@spheratile.es</p>
              </div>
            </div>
          </div>

          {/* Dirección de facturación */}
          <div className="p-4 lg:p-6 border-b border-neutral-200 bg-neutral-50">
            <h3 className="text-xs lg:text-sm font-medium text-neutral-500 mb-3">DIRECCIÓN DE FACTURACIÓN</h3>
            <p className="text-neutral-900 text-sm lg:text-base whitespace-pre-line">{factura.direccion_facturacion}</p>
          </div>

          {/* Detalle de la factura */}
          <div className="p-4 lg:p-6">
            <h3 className="text-xs lg:text-sm font-medium text-neutral-500 mb-4">DETALLE</h3>

            {/* Mobile view - card layout */}
            <div className="lg:hidden space-y-3">
              {factura.items.map((item) => (
                <div key={item.id} className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                  <div className="flex items-start gap-3 mb-2">
                    {item.producto_imagen && (
                      <img
                        src={item.producto_imagen}
                        alt={item.producto_nombre}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm truncate">{item.producto_nombre}</p>
                      <p className="text-xs text-neutral-500">Ref: {item.producto_referencia}</p>
                    </div>
                    {item.producto_slug && (
                      <ProductQRCode productSlug={item.producto_slug} size={40} expandable />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Cantidad</span>
                      <span className="font-medium">{item.cantidad_m2.toFixed(2)} m²</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Precio</span>
                      <span className="font-medium">{formatCurrency(item.precio_m2)}€/m²</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block">Importe</span>
                      <span className="font-medium text-primary-600">{formatCurrency(item.subtotal)}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view - table layout */}
            <table className="hidden lg:table w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Descripción</th>
                  <th className="text-center px-4 py-2 text-xs font-medium text-neutral-500 uppercase">QR</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Cantidad</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Precio unit.</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {factura.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.producto_imagen && (
                          <img
                            src={item.producto_imagen}
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
                    <td className="px-4 py-3 text-center">
                      {item.producto_slug && (
                        <ProductQRCode productSlug={item.producto_slug} size={56} expandable />
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
            <div className="mt-4 lg:mt-6 flex justify-end">
              <div className="w-full sm:w-64">
                <div className="flex justify-between py-2 border-b border-neutral-200 text-sm lg:text-base">
                  <span className="text-neutral-500">Base imponible</span>
                  <span className="text-neutral-900">{formatCurrency(factura.subtotal_euros)}€</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-200 text-sm lg:text-base">
                  <span className="text-neutral-500">IVA ({factura.iva_porcentaje}%)</span>
                  <span className="text-neutral-900">{formatCurrency(factura.iva_euros)}€</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-base lg:text-lg">
                  <span>TOTAL</span>
                  <span className="text-primary-600">{formatCurrency(factura.total_euros)}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div className="p-4 lg:p-6 border-t border-neutral-200 bg-neutral-50">
            <h3 className="text-xs lg:text-sm font-medium text-neutral-500 mb-3">FORMA DE PAGO</h3>
            <p className="text-neutral-900 text-sm lg:text-base">{METODOS_PAGO[factura.metodo_pago] || factura.metodo_pago}</p>
            {factura.metodo_pago === 'TRANSFERENCIA' && (
              <div className="mt-3 p-3 bg-white rounded border border-neutral-200">
                <p className="text-xs lg:text-sm text-neutral-500">Datos bancarios:</p>
                <p className="font-mono text-neutral-900 text-xs lg:text-sm break-all">ES12 3456 7890 1234 5678 9012</p>
                <p className="text-xs lg:text-sm text-neutral-500 mt-1">Concepto: {factura.numero_factura}</p>
              </div>
            )}
          </div>

          {/* Pie de página legal */}
          <div className="p-4 lg:p-6 border-t border-neutral-200 text-[10px] lg:text-xs text-neutral-500 text-center">
            <p>SPHERA TILE S.L. - CIF: B12345678 - Inscrita en el Registro Mercantil de Castellón</p>
            <p>Tomo 1234, Libro 567, Folio 89, Sección 8, Hoja CS-12345</p>
          </div>

          {/* Pedido relacionado */}
          <div className="p-4 lg:p-6 border-t border-neutral-200 bg-neutral-50 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs lg:text-sm text-neutral-500">Pedido relacionado</p>
                <p className="font-medium text-neutral-900 text-sm lg:text-base">{factura.pedido.numero_pedido}</p>
              </div>
              <Link
                href={`/cuenta/pedidos/${factura.pedido.id}`}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm text-center"
              >
                Ver pedido
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
