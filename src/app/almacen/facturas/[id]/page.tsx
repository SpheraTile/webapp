'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShareActions } from '@/components/ui/ShareActions'
import { ProformaDocument } from '@/components/ui/ProformaDocument'
import type { ProformaItem } from '@/components/ui/ProformaDocument'

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
      email: string
      telefono: string | null
      empresa: string | null
      nif_cif: string | null
      direccion: string | null
      ciudad: string | null
      provincia: string | null
      codigo_postal: string | null
      codigo_cliente?: string | null
      pais?: string | null
    }
  }
}

const ESTADOS_FACTURA = ['BORRADOR', 'EMITIDA', 'PAGADA', 'VENCIDA', 'ANULADA']
const METODOS_PAGO: Record<string, string> = {
  TRANSFERENCIA: 'TRANSFERENCIA BANCARIA',
  TARJETA: 'TARJETA',
  EFECTIVO: 'EFECTIVO',
  PAGARE: 'PAGARÉ',
  DOMICILIACION: 'DOMICILIACIÓN BANCARIA',
  PAGO_ANTICIPADO: 'PAGO ANTICIPADO',
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

export default function FacturaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)
  const [editandoPrecios, setEditandoPrecios] = useState(false)
  const [preciosEditados, setPreciosEditados] = useState<Record<string, number>>({})
  const [guardando, setGuardando] = useState(false)

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

  const iniciarEdicionPrecios = () => {
    if (!factura) return
    const precios: Record<string, number> = {}
    factura.items.forEach((item) => {
      precios[item.id] = item.precio_m2
    })
    setPreciosEditados(precios)
    setEditandoPrecios(true)
  }

  const cancelarEdicionPrecios = () => {
    setEditandoPrecios(false)
    setPreciosEditados({})
  }

  const handleGuardarPrecios = async () => {
    if (!factura) return
    setGuardando(true)
    try {
      const itemsActualizados = factura.items.map((item) => ({
        id: item.id,
        precio_m2: preciosEditados[item.id] ?? item.precio_m2,
        cantidad_m2: item.cantidad_m2,
      }))

      const response = await fetch(`/api/facturas/${factura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsActualizados }),
      })

      if (response.ok) {
        await fetchFactura()
        setEditandoPrecios(false)
        setPreciosEditados({})
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar precios')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar precios')
    } finally {
      setGuardando(false)
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

  const proformaItems = mapItemsToProforma(factura.items)
  const weight = calcWeight(factura.items)

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header - hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8 print:hidden">
        <div>
          <Link href="/almacen/facturas" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a facturas
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Factura {factura.numero_factura}</h1>
          <p className="text-neutral-500 mt-1 text-sm lg:text-base">Emitida: {formatDate(factura.createdAt)}</p>
        </div>
        <EstadoBadge estado={factura.estado} />
      </div>

      {/* Acciones de compartir */}
      <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 mb-4 lg:mb-6 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <ShareActions
            documentNumber={factura.numero_factura}
            documentType="factura"
            clientEmail={factura.pedido.user.email}
            clientPhone={factura.pedido.user.telefono || undefined}
            printRef={printRef}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-4">
            {factura.estado === 'EMITIDA' && (
              <button
                onClick={handleMarcarPagada}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
              >
                Marcar como pagada
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 hidden sm:inline">Estado:</span>
              <select
                value={factura.estado}
                onChange={(e) => handleCambiarEstado(e.target.value)}
                className="flex-1 sm:flex-initial border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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

      {/* Editar precios (fuera del PDF) */}
      {editandoPrecios && (
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-4 lg:mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-900">Editar precios</h3>
            <div className="flex items-center gap-2">
              <button onClick={cancelarEdicionPrecios} className="px-3 py-1 text-sm text-neutral-600 hover:text-neutral-800" disabled={guardando}>
                Cancelar
              </button>
              <button onClick={handleGuardarPrecios} disabled={guardando} className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {factura.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-2 bg-neutral-50 rounded">
                <span className="text-sm text-neutral-900 truncate flex-1">{item.producto_nombre}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preciosEditados[item.id] ?? item.precio_m2}
                    onChange={(e) => setPreciosEditados({ ...preciosEditados, [item.id]: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 border border-neutral-300 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-500">€/m²</span>
                </div>
                <span className="text-sm font-medium w-24 text-right">
                  {formatCurrency(item.cantidad_m2 * (preciosEditados[item.id] ?? item.precio_m2))}€
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!editandoPrecios && (
        <div className="mb-4 print:hidden">
          <button onClick={iniciarEdicionPrecios} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Editar precios
          </button>
        </div>
      )}

      {/* Documento imprimible (PDF) */}
      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
        <ProformaDocument
          type="FACTURA"
          documentNumber={factura.numero_factura}
          date={factura.createdAt}
          client={{
            codigo: factura.pedido.user.codigo_cliente,
            nombre: factura.pedido.user.nombre,
            empresa: factura.pedido.user.empresa,
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
      <div className="mt-4 bg-white rounded-xl shadow-sm p-4 lg:p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs lg:text-sm text-neutral-500">Pedido relacionado</p>
            <p className="font-medium text-neutral-900 text-sm lg:text-base">{factura.pedido.numero_pedido}</p>
          </div>
          <Link
            href={`/almacen/pedidos/${factura.pedido.id}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm text-center"
          >
            Ver pedido
          </Link>
        </div>
      </div>
    </div>
  )
}
