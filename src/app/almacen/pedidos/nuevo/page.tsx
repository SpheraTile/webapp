'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Cliente {
  id: string
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

interface Producto {
  id: string
  nombre: string
  referencia: string
  precio_m2: number
  stock_m2: number
  m2_caja: number
}

interface ItemCarrito {
  productoId: string
  producto: Producto
  cantidad_cajas: number
  cantidad_m2: number
  subtotal: number
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function NuevoPedidoPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [clienteId, setClienteId] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [direccion_envio, setDireccionEnvio] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [provincia, setProvincia] = useState('')
  const [codigo_postal, setCodigoPostal] = useState('')
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<ItemCarrito[]>([])

  // Producto a añadir
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidadCajas, setCantidadCajas] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, productosRes] = await Promise.all([
          fetch('/api/clientes'),
          fetch('/api/productos?limit=1000'),
        ])

        if (clientesRes.ok) {
          const data = await clientesRes.json()
          setClientes(data.clientes || [])
        }

        if (productosRes.ok) {
          const data = await productosRes.json()
          setProductos(data.productos || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Cuando cambia el cliente, auto-rellenar dirección
  useEffect(() => {
    if (clienteId) {
      const cliente = clientes.find((c) => c.id === clienteId)
      if (cliente) {
        setClienteSeleccionado(cliente)
        setDireccionEnvio(cliente.direccion || '')
        setCiudad(cliente.ciudad || '')
        setProvincia(cliente.provincia || '')
        setCodigoPostal(cliente.codigo_postal || '')
      }
    } else {
      setClienteSeleccionado(null)
    }
  }, [clienteId, clientes])

  const handleAddProducto = () => {
    if (!productoSeleccionado || cantidadCajas < 1) return

    const producto = productos.find((p) => p.id === productoSeleccionado)
    if (!producto) return

    // Verificar si ya está en el carrito
    const existingIndex = items.findIndex((item) => item.productoId === producto.id)
    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].cantidad_cajas += cantidadCajas
      newItems[existingIndex].cantidad_m2 = newItems[existingIndex].cantidad_cajas * producto.m2_caja
      newItems[existingIndex].subtotal = newItems[existingIndex].cantidad_m2 * producto.precio_m2
      setItems(newItems)
    } else {
      const cantidad_m2 = cantidadCajas * producto.m2_caja
      setItems([
        ...items,
        {
          productoId: producto.id,
          producto,
          cantidad_cajas: cantidadCajas,
          cantidad_m2,
          subtotal: cantidad_m2 * producto.precio_m2,
        },
      ])
    }

    setProductoSeleccionado('')
    setCantidadCajas(1)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleUpdateCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return
    const newItems = [...items]
    newItems[index].cantidad_cajas = nuevaCantidad
    newItems[index].cantidad_m2 = nuevaCantidad * newItems[index].producto.m2_caja
    newItems[index].subtotal = newItems[index].cantidad_m2 * newItems[index].producto.precio_m2
    setItems(newItems)
  }

  const calcularTotales = () => {
    const total_m2 = items.reduce((sum, item) => sum + item.cantidad_m2, 0)
    const subtotal_euros = items.reduce((sum, item) => sum + item.subtotal, 0)
    const iva_porcentaje = 21
    const iva_euros = subtotal_euros * (iva_porcentaje / 100)
    const total_euros = subtotal_euros + iva_euros
    return { total_m2, subtotal_euros, iva_porcentaje, iva_euros, total_euros }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteId || items.length === 0) {
      alert('Selecciona un cliente y añade al menos un producto')
      return
    }

    setSubmitting(true)
    try {
      const totales = calcularTotales()
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: clienteId,
          direccion_envio,
          ciudad,
          provincia,
          codigo_postal,
          notas: notas || null,
          items: items.map((item) => ({
            productoId: item.productoId,
            producto_nombre: item.producto.nombre,
            producto_referencia: item.producto.referencia,
            cantidad_m2: item.cantidad_m2,
            cantidad_cajas: item.cantidad_cajas,
            precio_m2: item.producto.precio_m2,
            subtotal: item.subtotal,
          })),
          total_m2: totales.total_m2,
          subtotal_euros: totales.subtotal_euros,
          iva_porcentaje: totales.iva_porcentaje,
          iva_euros: totales.iva_euros,
          total_euros: totales.total_euros,
        }),
      })

      if (response.ok) {
        const pedido = await response.json()
        router.push(`/almacen/pedidos/${pedido.id}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al crear pedido')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear pedido')
    } finally {
      setSubmitting(false)
    }
  }

  const totales = calcularTotales()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/almacen/pedidos" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-flex items-center gap-1">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a pedidos
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Nuevo Pedido</h1>
        <p className="text-neutral-500 mt-1">Crear un pedido manualmente</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Selección de cliente */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Seleccionar cliente *
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecciona un cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.empresa ? `(${cliente.empresa})` : ''} - {cliente.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {clienteSeleccionado && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-neutral-600">
                <strong>Email:</strong> {clienteSeleccionado.email}
                {clienteSeleccionado.telefono && (
                  <> | <strong>Tel:</strong> {clienteSeleccionado.telefono}</>
                )}
                {clienteSeleccionado.nif_cif && (
                  <> | <strong>NIF/CIF:</strong> {clienteSeleccionado.nif_cif}</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Dirección de envío */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Dirección de Envío</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={direccion_envio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Provincia
              </label>
              <input
                type="text"
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Código Postal *
              </label>
              <input
                type="text"
                value={codigo_postal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Instrucciones especiales..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Productos</h2>

          {/* Añadir producto */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Producto
              </label>
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecciona un producto...</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} ({producto.referencia}) - {formatCurrency(producto.precio_m2)}€/m²
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Cajas
              </label>
              <input
                type="number"
                min="1"
                value={cantidadCajas}
                onChange={(e) => setCantidadCajas(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddProducto}
                disabled={!productoSeleccionado}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Añadir
              </button>
            </div>
          </div>

          {/* Lista de productos */}
          {items.length === 0 ? (
            <p className="text-center text-neutral-500 py-8">No hay productos añadidos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Producto</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Cajas</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">m²</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Precio/m²</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-neutral-900">{item.producto.nombre}</div>
                        <div className="text-sm text-neutral-500">{item.producto.referencia}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateCantidad(index, item.cantidad_cajas - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded hover:bg-neutral-200"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">{item.cantidad_cajas}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCantidad(index, item.cantidad_cajas + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded hover:bg-neutral-200"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-900">
                        {item.cantidad_m2.toFixed(2)} m²
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-900">
                        {formatCurrency(item.producto.precio_m2)}€
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-neutral-900">
                        {formatCurrency(item.subtotal)}€
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen y totales */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Resumen</h2>
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-neutral-900">{formatCurrency(totales.subtotal_euros)}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">IVA ({totales.iva_porcentaje}%)</span>
                <span className="text-neutral-900">{formatCurrency(totales.iva_euros)}€</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-bold text-xl text-neutral-900">{formatCurrency(totales.total_euros)}€</span>
              </div>
              <div className="text-right text-sm text-neutral-500">
                Total: {totales.total_m2.toFixed(2)} m²
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Link
            href="/almacen/pedidos"
            className="px-6 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting || items.length === 0 || !clienteId}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creando...' : 'Crear Pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}
