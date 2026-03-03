'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'

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
  almacen: 'PRINCIPAL' | 'LOGISTICS' | 'AMBOS'
  mostrar_en_grid: boolean
}

export default function ProductosAlmacenPage() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroSerie, setFiltroSerie] = useState<string>('todos')
  const [filtroFormato, setFiltroFormato] = useState<string>('todos')
  const [orden, setOrden] = useState<string>('nombre-asc')
  const [productos, setProductos] = useState<Producto[]>([])
  const [series, setSeries] = useState<string[]>([])
  const [formatos, setFormatos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [editStockValue, setEditStockValue] = useState('')
  const [pagina, setPagina] = useState(1)
  const productosPorPagina = 50
  const { showToast } = useToast()
  const confirm = useConfirm()

  const fetchProductos = async () => {
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('busqueda', busqueda)

      const response = await fetch(`/api/productos?limit=1000&${params.toString()}`)
      const data = await response.json()
      const productos = data.productos || []

      // Extraer series y formatos únicos
      const uniqueSeries = [...new Set(productos.map((p: Producto) => p.serie))] as string[]
      const uniqueFormatos = [...new Set(productos.map((p: Producto) => p.formato))] as string[]

      setSeries(uniqueSeries.sort())
      setFormatos(uniqueFormatos.sort())
      setProductos(productos)
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

  // Filtrar y ordenar productos
  const filteredProductos = productos
    .filter(p => {
      if (filtroSerie !== 'todos' && p.serie !== filtroSerie) return false
      if (filtroFormato !== 'todos' && p.formato !== filtroFormato) return false
      return true
    })
    .sort((a, b) => {
      const [campo, direccion] = orden.split('-')
      const multiplicador = direccion === 'asc' ? 1 : -1

      if (campo === 'nombre') {
        return a.nombre.localeCompare(b.nombre) * multiplicador
      } else if (campo === 'referencia') {
        return a.referencia.localeCompare(b.referencia) * multiplicador
      } else if (campo === 'stock') {
        return (a.stock_m2 - b.stock_m2) * multiplicador
      } else if (campo === 'precio') {
        return (a.precio_m2 - b.precio_m2) * multiplicador
      }
      return 0
    })

  // Paginación
  const totalPages = Math.ceil(filteredProductos.length / productosPorPagina)
  const startIndex = (pagina - 1) * productosPorPagina
  const endIndex = startIndex + productosPorPagina
  const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

  // Reset a página 1 cuando cambian filtros
  useEffect(() => {
    setPagina(1)
  }, [filtroSerie, filtroFormato, orden])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Eliminar producto',
      message: '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })

    if (!confirmed) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProductos(productos.filter((p) => p.id !== id))
        showToast('Producto eliminado correctamente', 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Error al eliminar producto', 'error')
      }
    } catch (error) {
      console.error('Error deleting producto:', error)
      showToast('Error al eliminar producto', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleStockSave = async (id: string) => {
    const newStock = parseFloat(editStockValue)
    if (isNaN(newStock) || newStock < 0) {
      setEditingStock(null)
      return
    }

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_m2: newStock }),
      })

      if (res.ok) {
        setProductos(productos.map((p) => p.id === id ? { ...p, stock_m2: newStock } : p))
        showToast('Stock actualizado', 'success')
      } else {
        showToast('Error al actualizar stock', 'error')
      }
    } catch {
      showToast('Error al actualizar stock', 'error')
    }
    setEditingStock(null)
  }

  const handleAlmacenChange = async (id: string, nuevoAlmacen: 'PRINCIPAL' | 'LOGISTICS' | 'AMBOS') => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ almacen: nuevoAlmacen }),
      })

      if (res.ok) {
        setProductos(productos.map((p) => p.id === id ? { ...p, almacen: nuevoAlmacen } : p))
        showToast('Almacén actualizado', 'success')
      }
    } catch {
      showToast('Error al actualizar almacén', 'error')
    }
  }

  const handleEstadoChange = async (id: string, nuevoEstado: 'NORMAL' | 'NOVEDAD' | 'OFERTA') => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado_producto: nuevoEstado }),
      })

      if (res.ok) {
        setProductos(productos.map((p) => p.id === id ? { ...p, estado_producto: nuevoEstado } : p))
        showToast('Estado actualizado', 'success')
      }
    } catch {
      showToast('Error al actualizar estado', 'error')
    }
  }

  const productosConBajoStock = productos.filter((p) => p.stock_m2 < 100).length
  const totalStock = productos.reduce((sum, p) => sum + p.stock_m2, 0)
  const numSeries = new Set(productos.map((p) => p.serie)).size

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

        {/* Filtros y ordenación */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Filtro por serie */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Serie:</label>
            <select
              value={filtroSerie}
              onChange={(e) => setFiltroSerie(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todas</option>
              {series.map(serie => (
                <option key={serie} value={serie}>{serie}</option>
              ))}
            </select>
          </div>

          {/* Filtro por formato */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Formato:</label>
            <select
              value={filtroFormato}
              onChange={(e) => setFiltroFormato(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="todos">Todos</option>
              {formatos.map(formato => (
                <option key={formato} value={formato}>{formato}</option>
              ))}
            </select>
          </div>

          {/* Ordenación */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Ordenar por:</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="nombre-asc">Nombre (A-Z)</option>
              <option value="nombre-desc">Nombre (Z-A)</option>
              <option value="referencia-asc">Referencia (A-Z)</option>
              <option value="referencia-desc">Referencia (Z-A)</option>
              <option value="stock-desc">Stock (mayor a menor)</option>
              <option value="stock-asc">Stock (menor a mayor)</option>
              <option value="precio-asc">Precio (menor a mayor)</option>
              <option value="precio-desc">Precio (mayor a menor)</option>
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="ml-auto text-sm text-neutral-500">
            {filteredProductos.length} producto{filteredProductos.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500">
            No hay productos. <Link href="/almacen/productos/nuevo" className="text-primary-600 hover:underline">Crear uno</Link>
          </div>
        ) : (
          <>
            {/* Vista móvil - Cards */}
            <div className="lg:hidden divide-y divide-neutral-200">
              {paginatedProductos.map((producto) => (
                <div key={producto.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-900 truncate">{producto.nombre}</div>
                      <div className="text-sm text-neutral-500">{producto.referencia} · {producto.formato}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-semibold text-neutral-900">{producto.precio_m2.toFixed(2)}€/m²</span>
                        <span className={`text-sm ${producto.stock_m2 < 100 ? 'text-red-600' : 'text-neutral-500'}`}>
                          {producto.stock_m2.toLocaleString('es-ES')} m²
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/almacen/productos/${producto.id}/editar`}
                      className="flex-1 py-2 text-center text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      disabled={deleting === producto.id}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deleting === producto.id ? '...' : 'Eliminar'}
                    </button>
                  </div>
                  {/* Acciones rápidas */}
                  <div className="mt-3 p-2 bg-neutral-50 rounded-lg space-y-2">
                    {/* Novedad - Icono de estrella */}
                    <button
                      onClick={() => handleEstadoChange(producto.id, producto.estado_producto === 'NOVEDAD' ? 'NORMAL' : 'NOVEDAD')}
                      className="flex items-center gap-2 w-full"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={producto.estado_producto === 'NOVEDAD' ? '#fbbf24' : 'none'}
                        stroke={producto.estado_producto === 'NOVEDAD' ? '#fbbf24' : '#9ca3af'}
                        strokeWidth="2"
                        className={producto.estado_producto === 'NOVEDAD' ? 'drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : ''}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className={`text-xs ${producto.estado_producto === 'NOVEDAD' ? 'text-amber-500 font-medium' : 'text-neutral-500'}`}>
                        {producto.estado_producto === 'NOVEDAD' ? 'Novedad' : 'No novedad'}
                      </span>
                    </button>
                    {/* Almacén - Toggle con texto */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${producto.almacen === 'PRINCIPAL' || producto.almacen === 'AMBOS' ? 'text-green-600' : 'text-neutral-400'}`}>
                        Principal
                      </span>
                      <button
                        onClick={() => handleAlmacenChange(producto.id, producto.almacen === 'PRINCIPAL' ? 'AMBOS' : producto.almacen === 'AMBOS' ? 'LOGISTICS' : 'PRINCIPAL')}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          producto.almacen === 'PRINCIPAL' ? 'bg-green-500' : producto.almacen === 'AMBOS' ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-blue-500'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                            producto.almacen === 'PRINCIPAL' ? 'left-1' : producto.almacen === 'AMBOS' ? 'left-1/2 -translate-x-1/2' : 'right-1'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-medium ${producto.almacen === 'LOGISTICS' || producto.almacen === 'AMBOS' ? 'text-blue-600' : 'text-neutral-400'}`}>
                        Logistics
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden lg:block">
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
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      NOVEDAD
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Almacén
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedProductos.map((producto) => (
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
                        {editingStock === producto.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleStockSave(producto.id)
                                if (e.key === 'Escape') setEditingStock(null)
                              }}
                              onBlur={() => handleStockSave(producto.id)}
                              autoFocus
                              step="0.01"
                              min="0"
                              className="w-24 px-2 py-1 text-sm border border-primary-400 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-xs text-neutral-500">m²</span>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer group"
                            onClick={() => {
                              setEditingStock(producto.id)
                              setEditStockValue(String(producto.stock_m2))
                            }}
                            title="Clic para editar stock"
                          >
                            <div className={`font-medium ${producto.stock_m2 < 100 ? 'text-red-600' : 'text-neutral-900'} group-hover:text-primary-600 transition-colors`}>
                              {producto.stock_m2.toLocaleString('es-ES')} m²
                              <svg className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </div>
                            <div className="text-xs text-neutral-500">
                              {Math.floor(producto.stock_m2 / producto.m2_caja)} cajas
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEstadoChange(producto.id, producto.estado_producto === 'NOVEDAD' ? 'NORMAL' : 'NOVEDAD')}
                          className="flex items-center gap-2"
                          title={producto.estado_producto === 'NOVEDAD' ? 'Novedad - Clic para quitar' : 'Normal - Clic para marcar novedad'}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={producto.estado_producto === 'NOVEDAD' ? '#fbbf24' : 'none'}
                            stroke={producto.estado_producto === 'NOVEDAD' ? '#fbbf24' : '#9ca3af'}
                            strokeWidth="2"
                            className={producto.estado_producto === 'NOVEDAD' ? 'drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : ''}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className={`text-xs ${producto.estado_producto === 'NOVEDAD' ? 'text-amber-500 font-medium' : 'text-neutral-500'}`}>
                            {producto.estado_producto === 'NOVEDAD' ? 'Sí' : 'No'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${producto.almacen === 'PRINCIPAL' || producto.almacen === 'AMBOS' ? 'text-green-600' : 'text-neutral-400'}`}>
                            Principal
                          </span>
                          <button
                            onClick={() => handleAlmacenChange(producto.id, producto.almacen === 'PRINCIPAL' ? 'AMBOS' : producto.almacen === 'AMBOS' ? 'LOGISTICS' : 'PRINCIPAL')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                              producto.almacen === 'PRINCIPAL' ? 'bg-green-500' : producto.almacen === 'AMBOS' ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-blue-500'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                                producto.almacen === 'PRINCIPAL' ? 'left-1' : producto.almacen === 'AMBOS' ? 'left-1/2 -translate-x-1/2' : 'right-1'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${producto.almacen === 'LOGISTICS' || producto.almacen === 'AMBOS' ? 'text-blue-600' : 'text-neutral-400'}`}>
                            Logistics
                          </span>
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {!loading && paginatedProductos.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pag => (
              <button
                key={pag}
                onClick={() => setPagina(pag)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pag === pagina
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50'
                  }`}
              >
                {pag}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPagina(p => Math.min(totalPages, p + 1))}
            disabled={pagina === totalPages}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 text-sm text-neutral-500">
        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
      </div>
    </div>
  )
}
