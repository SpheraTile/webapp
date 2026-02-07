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
    id: string
    numero_pedido: string
    items: ItemPedido[]
    user: {
      nombre: string
      email: string
      telefono: string | null
      empresa: string | null
      nif_cif: string | null
      codigo_cliente?: string | null
      pais?: string | null
    }
  }
}

const ESTADOS_ALBARAN = ['BORRADOR', 'EMITIDO', 'ENTREGADO', 'ANULADO']

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
    EMITIDO: 'bg-blue-100 text-blue-700',
    ENTREGADO: 'bg-green-100 text-green-700',
    ANULADO: 'bg-red-100 text-red-700',
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
    precioM2: 0,
    importe: 0,
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

export default function AlbaranDetallePage() {
  const params = useParams()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [albaran, setAlbaran] = useState<Albaran | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [transportista, setTransportista] = useState('')
  const [matricula, setMatricula] = useState('')
  const [notasAlbaran, setNotasAlbaran] = useState('')

  const fetchAlbaran = async () => {
    try {
      const response = await fetch(`/api/albaranes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAlbaran(data)
        setTransportista(data.transportista || '')
        setMatricula(data.matricula || '')
        setNotasAlbaran(data.notas || '')
      } else {
        router.push('/almacen/albaranes')
      }
    } catch (error) {
      console.error('Error fetching albaran:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbaran()
  }, [params.id])

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!albaran) return
    try {
      const response = await fetch(`/api/albaranes/${albaran.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (response.ok) {
        fetchAlbaran()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleGuardarDatos = async () => {
    if (!albaran) return
    try {
      const response = await fetch(`/api/albaranes/${albaran.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transportista: transportista || null,
          matricula: matricula || null,
          notas: notasAlbaran || null,
        }),
      })
      if (response.ok) {
        fetchAlbaran()
        setEditando(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar')
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

  if (!albaran) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-500">Albarán no encontrado</p>
      </div>
    )
  }

  const proformaItems = mapItemsToProforma(albaran.pedido.items)
  const weight = calcWeight(albaran.pedido.items)

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header - hidden when printing */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 lg:mb-8 print:hidden">
        <div>
          <Link href="/almacen/albaranes" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a albaranes
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Albarán {albaran.numero_albaran}</h1>
          <p className="text-neutral-500 mt-1 text-sm lg:text-base">Fecha: {formatDate(albaran.createdAt)}</p>
        </div>
        <EstadoBadge estado={albaran.estado} />
      </div>

      {/* Acciones de compartir */}
      <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 mb-4 lg:mb-6 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          <ShareActions
            documentNumber={albaran.numero_albaran}
            documentType="albaran"
            clientEmail={albaran.pedido.user.email}
            clientPhone={albaran.pedido.user.telefono || undefined}
            printRef={printRef}
          />

          {/* Selector de estado */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 hidden sm:inline">Cambiar estado:</span>
            <select
              value={albaran.estado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              className="flex-1 sm:flex-initial border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {ESTADOS_ALBARAN.map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0) + estado.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Datos de transporte (fuera del PDF) */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-4 lg:mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs lg:text-sm font-medium text-neutral-500">DATOS DE TRANSPORTE</h3>
          {!editando && (
            <button
              onClick={() => setEditando(true)}
              className="text-primary-600 hover:text-primary-700 text-xs lg:text-sm"
            >
              Editar
            </button>
          )}
        </div>
        {editando ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm text-neutral-600 mb-1">Transportista</label>
              <input
                type="text"
                value={transportista}
                onChange={(e) => setTransportista(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs lg:text-sm text-neutral-600 mb-1">Matrícula</label>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs lg:text-sm text-neutral-600 mb-1">Notas</label>
              <input
                type="text"
                value={notasAlbaran}
                onChange={(e) => setNotasAlbaran(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2">
              <button
                onClick={() => setEditando(false)}
                className="px-3 lg:px-4 py-2 text-neutral-600 hover:text-neutral-800 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarDatos}
                className="px-3 lg:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4 text-xs lg:text-sm">
            <div>
              <span className="text-neutral-500">Transportista:</span>
              <span className="ml-2 text-neutral-900">{albaran.transportista || '-'}</span>
            </div>
            <div>
              <span className="text-neutral-500">Matrícula:</span>
              <span className="ml-2 text-neutral-900">{albaran.matricula || '-'}</span>
            </div>
            <div>
              <span className="text-neutral-500">Notas:</span>
              <span className="ml-2 text-neutral-900">{albaran.notas || '-'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Documento imprimible (PDF) */}
      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
        <ProformaDocument
          type="ALBARÁN DE ENTREGA"
          documentNumber={albaran.numero_albaran}
          date={albaran.createdAt}
          client={{
            codigo: albaran.pedido.user.codigo_cliente,
            nombre: albaran.pedido.user.nombre,
            empresa: albaran.pedido.user.empresa,
            pais: albaran.pedido.user.pais,
            nif: albaran.pedido.user.nif_cif,
            telefono: albaran.pedido.user.telefono,
            direccion: albaran.direccion_entrega,
          }}
          items={proformaItems}
          totals={{
            totalM2: proformaItems.reduce((s, i) => s + i.m2, 0),
            totalCajas: proformaItems.reduce((s, i) => s + i.cajas, 0),
            totalPallets: proformaItems.reduce((s, i) => s + i.pallets, 0),
            subtotal: 0,
            total: 0,
          }}
          weight={weight}
          observations={albaran.notas || 'MERCANCIA DE ORIGEN ESPAÑOL'}
          showSignatures
          showPrices={false}
        />
      </div>

      {/* Pedido relacionado */}
      <div className="mt-4 bg-white rounded-xl shadow-sm p-4 lg:p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs lg:text-sm text-neutral-500">Pedido relacionado</p>
            <p className="font-medium text-neutral-900 text-sm lg:text-base">{albaran.pedido.numero_pedido}</p>
          </div>
          <Link
            href={`/almacen/pedidos/${albaran.pedido.id}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm text-center"
          >
            Ver pedido
          </Link>
        </div>
      </div>
    </div>
  )
}
