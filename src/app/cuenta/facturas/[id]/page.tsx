'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { ProformaDocument } from '@/components/ui/ProformaDocument'
import type { ProformaItem } from '@/components/ui/ProformaDocument'
import { downloadPDF } from '@/lib/pdf'

interface ItemFactura {
  id: string
  producto_nombre: string
  producto_referencia: string
  producto_slug: string | null
  producto_imagen: string | null
  producto_formato?: string | null
  producto_calidad?: string | null
  producto_hs_code?: string | null
  producto_cajas_palet?: number | null
  producto_peso_caja_kg?: number | null
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
  notas: string | null
  fecha_vencimiento: string
  fecha_pago: string | null
  createdAt: string
  items: ItemFactura[]
  pedido: {
    id: string
    numero_pedido: string
    user: {
      nombre: string
      codigo_cliente?: string | null
      pais?: string | null
      nif_cif?: string | null
      telefono?: string | null
    }
  }
}

const METODOS_PAGO: Record<string, string> = {
  TRANSFERENCIA: 'TRANSFERENCIA BANCARIA',
  TARJETA: 'TARJETA',
  EFECTIVO: 'EFECTIVO',
  PAGARE: 'PAGARÉ',
  DOMICILIACION: 'DOMICILIACIÓN BANCARIA',
  PAGO_ANTICIPADO: 'PAGO ANTICIPADO',
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

function mapItemsToProforma(items: ItemFactura[]): ProformaItem[] {
  return items.map((item) => ({
    formato: item.producto_formato || '-',
    descripcion: `${item.producto_nombre} (Ref: ${item.producto_referencia})`,
    calidad: item.producto_calidad === 'COM' ? 'COM' : item.producto_calidad === 'PRIMERA' ? '1ª' : '-',
    m2: item.cantidad_m2,
    cajas: item.cantidad_cajas,
    pallets: item.producto_cajas_palet ? item.cantidad_cajas / item.producto_cajas_palet : 0,
    precioM2: item.precio_m2,
    importe: item.subtotal,
    qrSlug: item.producto_slug,
    hsCode: item.producto_hs_code || null,
  }))
}

function calcWeight(items: ItemFactura[]): { net: number; gross: number } {
  const net = items.reduce((sum, item) => {
    return sum + (item.cantidad_cajas * (item.producto_peso_caja_kg || 25))
  }, 0)
  return { net, gross: Math.ceil(net * 1.02) }
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

  const proformaItems = mapItemsToProforma(factura.items)
  const weight = calcWeight(factura.items)

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

        {/* Documento imprimible (PDF) */}
        <div ref={printRef} className="bg-white lg:rounded-xl lg:shadow-sm overflow-hidden print:shadow-none print:rounded-none">
          <ProformaDocument
            type="FACTURA"
            documentNumber={factura.numero_factura}
            date={factura.createdAt}
            client={{
              codigo: factura.pedido.user.codigo_cliente,
              nombre: factura.pedido.user.nombre,
              pais: factura.pedido.user.pais,
              nif: factura.pedido.user.nif_cif,
              telefono: factura.pedido.user.telefono,
              direccion: factura.direccion_facturacion,
            }}
            items={proformaItems}
            totals={{
              totalM2: proformaItems.reduce((s, i) => s + i.m2, 0),
              totalCajas: proformaItems.reduce((s, i) => s + i.cajas, 0),
              totalPallets: proformaItems.reduce((s, i) => s + i.pallets, 0),
              subtotal: factura.subtotal_euros,
              ivaPorcentaje: factura.iva_porcentaje,
              ivaEuros: factura.iva_euros,
              total: factura.total_euros,
            }}
            weight={weight}
            payment={{
              method: METODOS_PAGO[factura.metodo_pago] || factura.metodo_pago,
            }}
            observations={factura.notas || 'MERCANCIA DE ORIGEN ESPAÑOL'}
          />
        </div>

        {/* Pedido relacionado */}
        <div className="p-4 lg:mt-4 lg:p-6 lg:bg-white lg:rounded-xl lg:shadow-sm print:hidden">
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
  )
}
