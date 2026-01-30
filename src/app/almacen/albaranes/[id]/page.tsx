'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShareActions } from '@/components/ui/ShareActions'

interface ItemPedido {
  id: string
  producto_nombre: string
  producto_referencia: string
  cantidad_m2: number
  cantidad_cajas: number
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header - hidden when printing */}
      <div className="flex items-start justify-between mb-8 print:hidden">
        <div>
          <Link href="/almacen/albaranes" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a albaranes
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">Albarán {albaran.numero_albaran}</h1>
          <p className="text-neutral-500 mt-1">Fecha: {formatDate(albaran.createdAt)}</p>
        </div>
        <EstadoBadge estado={albaran.estado} />
      </div>

      {/* Acciones de compartir */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ShareActions
            title="Albarán"
            documentNumber={albaran.numero_albaran}
            documentType="albaran"
            clientEmail={albaran.pedido.user.email}
            clientPhone={albaran.pedido.user.telefono || undefined}
          />

          {/* Selector de estado */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Cambiar estado:</span>
            <select
              value={albaran.estado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

      {/* Documento imprimible */}
      <div ref={printRef} className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
        {/* Cabecera del documento */}
        <div className="p-6 border-b border-neutral-200 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">ALBARÁN DE ENTREGA</h2>
              <p className="text-lg font-medium text-primary-600">{albaran.numero_albaran}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">SPHERA TILE</p>
              <p className="text-sm text-neutral-500">CIF: B12345678</p>
              <p className="text-sm text-neutral-500">Tel: +34 964 123 456</p>
            </div>
          </div>
        </div>

        {/* Datos del cliente y envío */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-neutral-200">
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-2">CLIENTE</h3>
            <p className="font-medium text-neutral-900">{albaran.pedido.user.nombre}</p>
            {albaran.pedido.user.empresa && (
              <p className="text-neutral-700">{albaran.pedido.user.empresa}</p>
            )}
            {albaran.pedido.user.nif_cif && (
              <p className="text-neutral-500">NIF/CIF: {albaran.pedido.user.nif_cif}</p>
            )}
            <p className="text-neutral-500">{albaran.pedido.user.email}</p>
            {albaran.pedido.user.telefono && (
              <p className="text-neutral-500">Tel: {albaran.pedido.user.telefono}</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-500 mb-2">DIRECCIÓN DE ENTREGA</h3>
            <p className="text-neutral-900 whitespace-pre-line">{albaran.direccion_entrega}</p>
          </div>
        </div>

        {/* Datos de transporte */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between mb-4 print:hidden">
            <h3 className="text-sm font-medium text-neutral-500">DATOS DE TRANSPORTE</h3>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Editar
              </button>
            )}
          </div>
          {editando ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Transportista</label>
                <input
                  type="text"
                  value={transportista}
                  onChange={(e) => setTransportista(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Matrícula</label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Notas</label>
                <input
                  type="text"
                  value={notasAlbaran}
                  onChange={(e) => setNotasAlbaran(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  onClick={() => setEditando(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarDatos}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-sm">
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

        {/* Mercancía */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">MERCANCÍA</h3>
          <table className="w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Producto</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Referencia</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Cajas</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-neutral-500 uppercase">m²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {albaran.pedido.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{item.producto_nombre}</td>
                  <td className="px-4 py-3 text-neutral-500">{item.producto_referencia}</td>
                  <td className="px-4 py-3 text-right text-neutral-900">{item.cantidad_cajas}</td>
                  <td className="px-4 py-3 text-right text-neutral-900">{item.cantidad_m2.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-neutral-300">
              <tr className="font-bold">
                <td colSpan={2} className="px-4 py-3 text-right">TOTAL</td>
                <td className="px-4 py-3 text-right">{albaran.total_cajas}</td>
                <td className="px-4 py-3 text-right">{albaran.total_m2.toFixed(2)} m²</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right text-neutral-500">
                  Peso total estimado: {albaran.peso_total_kg.toFixed(2)} kg
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Firmas */}
        <div className="p-6 border-t border-neutral-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-neutral-500 mb-12">Entregado por:</p>
              <div className="border-t border-neutral-300 pt-2">
                <p className="text-sm text-neutral-500">Firma y sello</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-12">Recibido por:</p>
              <div className="border-t border-neutral-300 pt-2">
                <p className="text-sm text-neutral-500">Firma, nombre y DNI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pedido relacionado */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 print:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Pedido relacionado</p>
              <p className="font-medium text-neutral-900">{albaran.pedido.numero_pedido}</p>
            </div>
            <Link
              href={`/almacen/pedidos/${albaran.pedido.id}`}
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
