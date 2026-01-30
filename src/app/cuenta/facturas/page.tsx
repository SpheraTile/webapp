'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconReceipt, IconChevronDown, IconDownload } from '@/components/ui/Icons'

interface Factura {
  id: string
  numero_factura: string
  createdAt: string
  fecha_vencimiento: string
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  estado: string
  pedido?: {
    numero_pedido: string
  }
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  })
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
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
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[estado] || 'bg-neutral-100 text-neutral-700'}`}>
      {labels[estado] || estado}
    </span>
  )
}

export default function MisFacturasPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchFacturas() {
      if (session?.user) {
        try {
          const response = await fetch('/api/mis-facturas')
          if (response.ok) {
            const data = await response.json()
            setFacturas(data.facturas || [])
          }
        } catch (error) {
          console.error('Error fetching facturas:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchFacturas()
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Mis Facturas" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-4xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Mis Facturas</h1>
          <p className="text-neutral-500 mt-1">Historial de facturas emitidas</p>
        </div>

        {facturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
              <IconReceipt size={40} className="text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              No tienes facturas
            </h2>
            <p className="text-neutral-600 text-center mb-8">
              Aquí aparecerán las facturas de tus pedidos
            </p>
            <Link href="/cuenta/pedidos" className="btn-primary">
              Ver mis pedidos
            </Link>
          </div>
        ) : (
          <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden">
            {/* Lista de facturas */}
            <div className="divide-y divide-neutral-100 lg:divide-neutral-200">
              {facturas.map((factura) => (
                <div
                  key={factura.id}
                  className="p-4 lg:p-6 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-neutral-900">
                          {factura.numero_factura}
                        </span>
                        <EstadoBadge estado={factura.estado} />
                      </div>
                      {factura.pedido && (
                        <p className="text-sm text-neutral-500 mb-1">
                          Pedido: {factura.pedido.numero_pedido}
                        </p>
                      )}
                      <p className="text-sm text-neutral-500">
                        Emitida: {formatDate(factura.createdAt)}
                      </p>
                      {factura.estado === 'EMITIDA' && (
                        <p className="text-sm text-amber-600">
                          Vence: {formatDate(factura.fecha_vencimiento)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">
                        {formatCurrency(factura.total_euros)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        IVA incl.
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/cuenta/facturas/${factura.id}`}
                      className="flex-1 py-2 px-4 text-center text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Ver detalle
                    </Link>
                    <button
                      onClick={() => window.open(`/api/mis-facturas/${factura.id}/pdf`, '_blank')}
                      className="py-2 px-4 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                    >
                      <IconDownload size={16} />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
