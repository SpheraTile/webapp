'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CatalogPage, type CatalogProduct } from '@/components/ui/CatalogPage'
import { CatalogCover } from '@/components/ui/CatalogCover'
import { exportToPDF } from '@/lib/pdf'

interface ApiProducto {
  id: string
  slug: string
  nombre: string
  referencia: string
  serie: string
  imagen: string
  formato: string
  calidad: string
  materia_prima: string
  aspecto: string
  acabado: string
  uso: string
  precio_m2: number
  stock_m2: number
  m2_caja: number
  piezas_caja: number
  cajas_palet: number
  peso_caja_kg: number
}

const PRODUCTS_PER_PAGE = 4

export default function CatalogoPage() {
  const [allProductos, setAllProductos] = useState<ApiProducto[]>([])
  const [series, setSeries] = useState<string[]>([])
  const [selectedSerie, setSelectedSerie] = useState('all')
  const [soloConStock, setSoloConStock] = useState(true)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [previewPage, setPreviewPage] = useState(0)

  const pdfRef = useRef<HTMLDivElement>(null)

  // Fetch all products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/productos?limit=500')
        const data = await res.json()
        const productos = data.productos || []
        setAllProductos(productos)

        const uniqueSeries = [...new Set(productos.map((p: ApiProducto) => p.serie))] as string[]
        setSeries(uniqueSeries.sort())
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filter products
  const filteredProducts = allProductos.filter((p) => {
    if (selectedSerie !== 'all' && p.serie !== selectedSerie) return false
    if (soloConStock && p.stock_m2 <= 0) return false
    return true
  })

  // Map to catalog products with price overrides
  const catalogProducts: CatalogProduct[] = filteredProducts.map((p) => ({
    ...p,
    precio_m2: priceOverrides[p.id] ?? p.precio_m2,
  }))

  // Chunk into pages of 4
  const pages: CatalogProduct[][] = []
  for (let i = 0; i < catalogProducts.length; i += PRODUCTS_PER_PAGE) {
    pages.push(catalogProducts.slice(i, i + PRODUCTS_PER_PAGE))
  }
  const totalPages = pages.length

  const handlePriceChange = useCallback((productId: string, newPrice: number) => {
    setPriceOverrides((prev) => ({ ...prev, [productId]: newPrice }))
  }, [])

  const resetPrices = useCallback(() => {
    setPriceOverrides({})
  }, [])

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || catalogProducts.length === 0) return

    setGeneratingPDF(true)
    try {
      const blob = await exportToPDF({
        filename: `Catalogo_SPHERA_TILE${selectedSerie !== 'all' ? `_${selectedSerie}` : ''}_${new Date().toISOString().slice(0, 10)}`,
        element: pdfRef.current,
        orientation: 'portrait',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Catalogo_SPHERA_TILE${selectedSerie !== 'all' ? `_${selectedSerie}` : ''}_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Catálogo</h1>
          <p className="text-sm text-neutral-500 mt-1">Genera catálogos PDF para enviar a clientes</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={generatingPDF || catalogProducts.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {generatingPDF ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Serie filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Serie:</label>
            <select
              value={selectedSerie}
              onChange={(e) => { setSelectedSerie(e.target.value); setPreviewPage(0) }}
              className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas las series</option>
              {series.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Stock filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={soloConStock}
              onChange={(e) => { setSoloConStock(e.target.checked); setPreviewPage(0) }}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700">Solo con stock</span>
          </label>

          {/* Reset prices */}
          {Object.keys(priceOverrides).length > 0 && (
            <button
              onClick={resetPrices}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Restaurar precios originales
            </button>
          )}

          {/* Counter */}
          <div className="ml-auto text-sm text-neutral-500">
            {catalogProducts.length} productos · {totalPages + 1} páginas
          </div>
        </div>
      </div>

      {/* Preview */}
      {catalogProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-neutral-500">No hay productos con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4">
          {/* Preview navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
              disabled={previewPage === 0}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-30"
            >
              Anterior
            </button>
            <span className="text-sm text-neutral-600">
              {previewPage === 0 ? 'Portada' : `Página ${previewPage} de ${totalPages}`}
            </span>
            <button
              onClick={() => setPreviewPage(Math.min(totalPages, previewPage + 1))}
              disabled={previewPage >= totalPages}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-30"
            >
              Siguiente
            </button>
          </div>

          {/* Preview content */}
          <div className="overflow-x-auto">
            {previewPage === 0 ? (
              <div className="mx-auto" style={{ width: '800px' }}>
                <CatalogCover
                  serie={selectedSerie !== 'all' ? selectedSerie : undefined}
                  productCount={catalogProducts.length}
                  date={today}
                />
              </div>
            ) : (
              <div className="mx-auto" style={{ width: '800px' }}>
                {/* Editable preview - show product grid with price inputs */}
                <div style={{ width: '800px', minHeight: '400px', padding: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div className="grid grid-cols-2 gap-4">
                    {pages[previewPage - 1]?.map((product) => (
                      <div key={product.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={product.imagen}
                            alt={product.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-sm text-neutral-900 truncate">{product.nombre}</p>
                          <p className="text-xs text-neutral-500">Ref: {product.referencia} · {product.serie}</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2 text-xs text-neutral-600">
                            <span>{product.formato}</span>
                            <span>{product.calidad}</span>
                            <span>{product.materia_prima}</span>
                            <span>{product.acabado}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <label className="text-xs text-neutral-500">€/m²:</label>
                            <input
                              type="number"
                              step="0.01"
                              value={priceOverrides[product.id] ?? product.precio_m2}
                              onChange={(e) => handlePriceChange(product.id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-sm font-semibold text-red-600 border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-xs text-neutral-400 ml-auto">Stock: {product.stock_m2.toFixed(2)} m²</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden PDF render container */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }} ref={pdfRef}>
        <div style={{ width: '800px' }}>
          {/* Cover */}
          <CatalogCover
            serie={selectedSerie !== 'all' ? selectedSerie : undefined}
            productCount={catalogProducts.length}
            date={today}
          />
          {/* Product pages */}
          {pages.map((pageProducts, i) => (
            <CatalogPage
              key={i}
              products={pageProducts}
              pageNumber={i + 1}
              totalPages={totalPages}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
