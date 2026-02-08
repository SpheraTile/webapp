'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { ProformaDocument } from '@/components/ui/ProformaDocument'
import type { ProformaItem } from '@/components/ui/ProformaDocument'
import { downloadPDF } from '@/lib/pdf'

interface ItemPedido {
  id: string
  producto_nombre: string
  producto_referencia: string
  cantidad_m2: number
  cantidad_cajas: number
  precio_m2: number
  subtotal: number
  producto: {
    imagen: string
    slug: string
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
  estado: string
  direccion_envio: string
  ciudad: string
  provincia?: string
  codigo_postal: string
  notas?: string
  total_m2: number
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  createdAt: string
  items: ItemPedido[]
  user: {
    nombre: string
    codigo_cliente?: string | null
    pais?: string | null
    nif_cif?: string | null
    telefono?: string | null
  }
}

const ESTADOS_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  PREPARANDO: { label: 'Preparando', color: 'bg-purple-100 text-purple-800' },
  ENVIADO: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
  ENTREGADO: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
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

export default function DetallePedidoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const printRef = useRef<HTMLDivElement>(null)
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchPedido() {
      if (session?.user && params.id) {
        try {
          const res = await fetch(`/api/pedidos/${params.id}`)
          if (res.ok) {
            const data = await res.json()
            setPedido(data)
          } else {
            router.push('/cuenta/pedidos')
          }
        } catch (error) {
          console.error('Error fetching pedido:', error)
          router.push('/cuenta/pedidos')
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchPedido()
    }
  }, [session, params.id, router])

  const handleDownloadPDF = async () => {
    if (!printRef.current || !pedido) return

    setGeneratingPDF(true)
    try {
      await downloadPDF({
        filename: `Pedido_${pedido.numero_pedido}`,
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

  if (!session || !pedido) {
    return null
  }

  const estado = ESTADOS_LABELS[pedido.estado] || { label: pedido.estado, color: 'bg-neutral-100 text-neutral-800' }
  const fecha = new Date(pedido.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const proformaItems = mapItemsToProforma(pedido.items)
  const weight = calcWeight(pedido.items)

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50 print:bg-white">
      <div className="print:hidden">
        <DesktopNav />
        <div className="lg:hidden">
          <Header titulo="Detalle del Pedido" showBack />
        </div>
      </div>

      <div className="lg:pt-20 lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-12 print:pt-0 print:max-w-none print:px-0 print:py-0">
        {/* Header desktop */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8 print:hidden">
          <div>
            <Link
              href="/cuenta/pedidos"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm mb-2 inline-flex items-center gap-1"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver a mis pedidos
            </Link>
            <h1 className="text-3xl font-bold text-neutral-900">{pedido.numero_pedido}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${estado.color}`}>
                {estado.label}
              </span>
              <span className="text-neutral-500">{fecha}</span>
            </div>
          </div>
        </div>

        {/* Info móvil */}
        <div className="lg:hidden p-4 border-b border-neutral-100 print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{pedido.numero_pedido}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${estado.color}`}>
              {estado.label}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{fecha}</p>
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
          </div>
        </div>

        {/* Documento imprimible (PDF) */}
        <div ref={printRef} className="bg-white lg:rounded-xl lg:shadow-sm overflow-hidden print:shadow-none print:rounded-none">
          <ProformaDocument
            type="PEDIDO"
            documentNumber={pedido.numero_pedido}
            date={pedido.createdAt}
            client={{
              codigo: pedido.user?.codigo_cliente,
              nombre: pedido.user?.nombre || session.user.name || '',
              pais: pedido.user?.pais,
              nif: pedido.user?.nif_cif,
              telefono: pedido.user?.telefono,
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

        {/* Dirección de envío */}
        <div className="p-4 lg:mt-4 lg:p-6 lg:bg-white lg:rounded-xl lg:shadow-sm print:hidden">
          <h3 className="font-semibold text-neutral-900 mb-2">Dirección de envío</h3>
          <p className="text-neutral-600">{pedido.direccion_envio}</p>
          <p className="text-neutral-600">
            {pedido.codigo_postal} {pedido.ciudad}
            {pedido.provincia && `, ${pedido.provincia}`}
          </p>
        </div>
      </div>
    </div>
  )
}
