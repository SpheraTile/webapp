'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Producto {
  id: string
  nombre: string
  referencia: string
  serie: string
  imagen: string
  formato: string
  precio_m2: number
  stock_m2: number
  calidad: string
  m2_caja: number
  tipo_pieza: string
  uso: string
  estado_producto: string
}

export default function ProductosAlmacenPage() {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchProductos = async () => {
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('busqueda', busqueda)

      const response = await fetch(`/api/productos?${params.toString()}`)
      const data = await response.json()
      setProductos(data.productos || [])
    } catch (error) {
      console.error('Error fetching productos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProductos()
    }, 300)
    return () => clearTimeout(debounce)
  }, [busqueda])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProductos(productos.filter((p) => p.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting producto:', error)
      alert('Error al eliminar producto')
    } finally {
      setDeleting(null)
    }
  }

  const productosConBajoStock = productos.filter((p) => p.stock_m2 < 100).length
  const totalStock = productos.reduce((sum, p) => sum + p.stock_m2, 0)
  const series = new Set(productos.map((p) => p.serie)).size

  const estadoLabels: Record<string, { text: string; color: string }> = {
    NORMAL: { text: '', color: '' },
    OFERTA: { text: 'Oferta', color: 'bg-red-100 text-red-700' },
    NOVEDAD: { text: 'Novedad', color: 'bg-primary-100 text-primary-700' },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Productos</h1>
          <p className="text-neutral-500 mt-1">Gestión del catálogo de productos</p>
        </div>
        <Link
          href="/almacen/productos/nuevo"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Total Productos</p>
          <p className="text-2xl font-bold text-neutral-900">{productos.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Stock Total</p>
          <p className="text-2xl font-bold text-neutral-900">
            {totalStock.toLocaleString('es-ES')} m²
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Bajo Stock</p>
          <p className="text-2xl font-bold text-red-600">{productosConBajoStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-neutral-500">Series</p>
          <p className="text-2xl font-bold text-neutral-900">{series}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, referencia, serie..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Serie
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Formato
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Precio/m²
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No hay productos. <Link href="/almacen/productos/nuevo" className="text-primary-600 hover:underline">Crear uno</Link>
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          <Image
                            src={producto.imagen}
                            alt={producto.nombre}
                            fill
                            className="object-cover"
                          />
                          {producto.estado_producto && estadoLabels[producto.estado_producto]?.text && (
                            <span className={`absolute top-0 left-0 text-[8px] px-1 rounded-br ${estadoLabels[producto.estado_producto].color}`}>
                              {estadoLabels[producto.estado_producto].text}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{producto.nombre}</div>
                          <div className="text-sm text-neutral-500">{producto.calidad}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-mono text-sm">
                      {producto.referencia}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {producto.serie}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {producto.formato}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {producto.precio_m2.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium ${producto.stock_m2 < 100 ? 'text-red-600' : 'text-neutral-900'}`}>
                        {producto.stock_m2.toLocaleString('es-ES')} m²
                      </div>
                      <div className="text-xs text-neutral-500">
                        {Math.floor(producto.stock_m2 / producto.m2_caja)} cajas
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/almacen/productos/${producto.id}/editar`}
                          className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                          title="Editar"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          disabled={deleting === producto.id}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deleting === producto.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-6 text-sm text-neutral-500">
        Mostrando {productos.length} productos
      </div>
    </div>
  )
}
