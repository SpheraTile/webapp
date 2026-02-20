'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CatalogPage, type CatalogProduct } from '@/components/ui/CatalogPage'
import { CatalogCover } from '@/components/ui/CatalogCover'
import { CatalogBackCover } from '@/components/ui/CatalogBackCover'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

// Detectar si un producto es alargado
function isElongatedProduct(product: ApiProducto): boolean {
  return (product.formato.includes('22.5') && product.formato.includes('119')) ||
         (product.formato.includes('23.3') && (product.formato.includes('120') || product.formato.includes('119')))
}

// Función para ordenar productos: cuadrados primero, luego 60x120, luego alargados
function sortProducts(products: ApiProducto[]): ApiProducto[] {
  return [...products].sort((a, b) => {
    // Detectar si es cuadrado
    const isSquare = (format: string) => {
      const match = format.match(/^\d+[.,]?\d*x\d+[.,]?\d*$/i)
      if (!match) return false
      const parts = format.toLowerCase().split('x')
      if (parts.length === 2) {
        const first = parseFloat(parts[0].replace(',', '.'))
        const second = parseFloat(parts[1].replace(',', '.'))
        return Math.abs(first - second) < 1
      }
      return false
    }

    // Detectar si es 60x120
    const is60x120 = (format: string) => {
      const parts = format.toLowerCase().split('x')
      if (parts.length === 2) {
        const first = parseFloat(parts[0].replace(',', '.'))
        const second = parseFloat(parts[1].replace(',', '.'))
        return (Math.abs(first - 60) < 1 && Math.abs(second - 120) < 5) ||
               (Math.abs(second - 60) < 1 && Math.abs(first - 120) < 5)
      }
      return false
    }

    const aIsSquare = isSquare(a.formato)
    const bIsSquare = isSquare(b.formato)
    const aIs60x120 = is60x120(a.formato)
    const bIs60x120 = is60x120(b.formato)
    const aIsElongated = isElongatedProduct(a)
    const bIsElongated = isElongatedProduct(b)

    // Prioridad: cuadrados (0), 60x120 (1), alargados (2), otros (3)
    const getPriority = (isSq: boolean, is60: boolean, isElong: boolean) => {
      if (isSq) return 0
      if (is60) return 1
      if (isElong) return 2
      return 3
    }

    const aPriority = getPriority(aIsSquare, aIs60x120, aIsElongated)
    const bPriority = getPriority(bIsSquare, bIs60x120, bIsElongated)

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // Si misma prioridad, ordenar por nombre
    return a.nombre.localeCompare(b.nombre)
  })
}

// Función para paginar productos agrupando por formato (no mezclar formatos diferentes)
function paginateProducts(products: ApiProducto[]): ApiProducto[][] {
  // Primero ordenar los productos
  const sortedProducts = sortProducts(products)

  // Agrupar productos por formato
  const productsByFormat: Record<string, ApiProducto[]> = {}
  sortedProducts.forEach(product => {
    const formato = product.formato
    if (!productsByFormat[formato]) {
      productsByFormat[formato] = []
    }
    productsByFormat[formato].push(product)
  })

  const pages: ApiProducto[][] = []

  // Ordenar los formatos por el tipo (cuadrados, 60x120, alargados, otros)
  const sortedFormats = Object.keys(productsByFormat).sort((a, b) => {
    const isSquare = (format: string) => {
      const match = format.match(/^\d+[.,]?\d*x\d+[.,]?\d*$/i)
      if (!match) return false
      const parts = format.toLowerCase().split('x')
      if (parts.length === 2) {
        const first = parseFloat(parts[0].replace(',', '.'))
        const second = parseFloat(parts[1].replace(',', '.'))
        return Math.abs(first - second) < 1
      }
      return false
    }

    const is60x120 = (format: string) => {
      const parts = format.toLowerCase().split('x')
      if (parts.length === 2) {
        const first = parseFloat(parts[0].replace(',', '.'))
        const second = parseFloat(parts[1].replace(',', '.'))
        return (Math.abs(first - 60) < 1 && Math.abs(second - 120) < 5) ||
               (Math.abs(second - 60) < 1 && Math.abs(first - 120) < 5)
      }
      return false
    }

    const aIsSquare = isSquare(a)
    const bIsSquare = isSquare(b)
    const aIs60x120 = is60x120(a)
    const bIs60x120 = is60x120(b)
    const aIsElongated = (a.includes('22.5') && a.includes('119')) ||
                         (a.includes('23.3') && (a.includes('120') || a.includes('119')))
    const bIsElongated = (b.includes('22.5') && b.includes('119')) ||
                         (b.includes('23.3') && (b.includes('120') || b.includes('119')))

    const getPriority = (isSq: boolean, is60: boolean, isElong: boolean) => {
      if (isSq) return 0
      if (is60) return 1
      if (isElong) return 2
      return 3
    }

    const aPriority = getPriority(aIsSquare, aIs60x120, aIsElongated)
    const bPriority = getPriority(bIsSquare, bIs60x120, bIsElongated)

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    return a.localeCompare(b)
  })

  // Paginar cada formato por separado en el orden correcto
  sortedFormats.forEach((formato) => {
    const formatProducts = productsByFormat[formato]
    const isElongated = (formato.includes('22.5') && formato.includes('119')) ||
                       (formato.includes('23.3') && (formato.includes('120') || formato.includes('119')))
    const productsPerPage = isElongated ? 2 : 4

    for (let i = 0; i < formatProducts.length; i += productsPerPage) {
      pages.push(formatProducts.slice(i, i + productsPerPage))
    }
  })

  return pages
}

export default function CatalogoPage() {
  const [allProductos, setAllProductos] = useState<ApiProducto[]>([])
  const [series, setSeries] = useState<string[]>([])
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set())
  const [formatos, setFormatos] = useState<string[]>([])
  const [selectedFormatos, setSelectedFormatos] = useState<Set<string>>(new Set())
  const [soloConStock, setSoloConStock] = useState(true)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [pdfProgress, setPdfProgress] = useState('')
  const [previewPage, setPreviewPage] = useState(0)
  const [coverImage, setCoverImage] = useState<string>('')
  const [backCoverImage, setBackCoverImage] = useState<string>('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingBackCover, setUploadingBackCover] = useState(false)

  const pdfContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/productos?limit=500')
        const data = await res.json()
        const productos = data.productos || []
        setAllProductos(productos)

        const uniqueSeries = [...new Set(productos.map((p: ApiProducto) => p.serie))] as string[]
        setSeries(uniqueSeries.sort())

        const uniqueFormatos = [...new Set(productos.map((p: ApiProducto) => p.formato))] as string[]
        setFormatos(uniqueFormatos.sort())
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
    if (selectedSeries.size > 0 && !selectedSeries.has(p.serie)) return false
    if (selectedFormatos.size > 0 && !selectedFormatos.has(p.formato)) return false
    if (soloConStock && p.stock_m2 <= 0) return false
    return true
  })

  // Map to catalog products with price overrides
  const catalogProducts: CatalogProduct[] = filteredProducts.map((p) => ({
    ...p,
    precio_m2: priceOverrides[p.id] ?? p.precio_m2,
  }))

  // Paginar productos inteligentemente (considerando productos alargados)
  const pages = paginateProducts(catalogProducts)
  const totalPages = pages.length

  const toggleSerie = useCallback((serie: string) => {
    setSelectedSeries((prev) => {
      const next = new Set(prev)
      if (next.has(serie)) {
        next.delete(serie)
      } else {
        next.add(serie)
      }
      return next
    })
    setPreviewPage(0)
  }, [])

  const toggleFormato = useCallback((formato: string) => {
    setSelectedFormatos((prev) => {
      const next = new Set(prev)
      if (next.has(formato)) {
        next.delete(formato)
      } else {
        next.add(formato)
      }
      return next
    })
    setPreviewPage(0)
  }, [])

  const selectAllSeries = useCallback(() => {
    setSelectedSeries(new Set())
    setPreviewPage(0)
  }, [])

  const selectAllFormatos = useCallback(() => {
    setSelectedFormatos(new Set())
    setPreviewPage(0)
  }, [])

  const handlePriceChange = useCallback((productId: string, newPrice: number) => {
    setPriceOverrides((prev) => ({ ...prev, [productId]: newPrice }))
  }, [])

  const resetPrices = useCallback(() => {
    setPriceOverrides({})
  }, [])

  const handleImageUpload = async (file: File, type: 'cover' | 'backcover') => {
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.')
      return
    }

    // Validar tipo
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert('Formato no válido. Usa JPG o PNG.')
      return
    }

    const setUploading = type === 'cover' ? setUploadingCover : setUploadingBackCover
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error al subir imagen')

      const data = await res.json()
      const imageUrl = data.url

      if (type === 'cover') {
        setCoverImage(imageUrl)
      } else {
        setBackCoverImage(imageUrl)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const serieLabel = selectedSeries.size === 0
    ? undefined
    : selectedSeries.size === 1
      ? [...selectedSeries][0]
      : `${selectedSeries.size} series`

  // Generate PDF page by page to avoid cutting
  const handleDownloadPDF = async () => {
    if (!pdfContainerRef.current || catalogProducts.length === 0) return

    setGeneratingPDF(true)
    setPdfProgress('Preparando...')

    try {
      const container = pdfContainerRef.current
      // Get all page divs (direct children of the container)
      const pageElements = container.children

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement
        setPdfProgress(`Página ${i + 1} de ${pageElements.length}...`)

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 800,
          height: 1130,
        })

        const imgData = canvas.toDataURL('image/png')

        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
      }

      const filename = `Catalogo_SPHERA_TILE${serieLabel ? `_${serieLabel}` : ''}_${new Date().toISOString().slice(0, 10)}`
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
    } finally {
      setGeneratingPDF(false)
      setPdfProgress('')
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
          {generatingPDF ? pdfProgress : 'Descargar PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        {/* Series chips */}
        <div className="mb-3">
          <label className="text-sm font-medium text-neutral-700 mb-2 block">Series:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={selectAllSeries}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                selectedSeries.size === 0
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
              }`}
            >
              Todas
            </button>
            {series.map((s) => (
              <button
                key={s}
                onClick={() => toggleSerie(s)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  selectedSeries.has(s)
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Formatos chips */}
        <div className="mb-3">
          <label className="text-sm font-medium text-neutral-700 mb-2 block">Tamaños:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={selectAllFormatos}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                selectedFormatos.size === 0
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
              }`}
            >
              Todos
            </button>
            {formatos.map((f) => (
              <button
                key={f}
                onClick={() => toggleFormato(f)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                  selectedFormatos.has(f)
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
            {catalogProducts.length} productos · {totalPages + (backCoverImage ? 2 : 1)} páginas
          </div>
        </div>

        {/* Custom cover images */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <label className="text-sm font-medium text-neutral-700 mb-3 block">Portadas personalizadas (800x1130px, JPG/PNG, máx 5MB):</label>
          <div className="flex flex-wrap gap-4">
            {/* Cover image */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-neutral-500 mb-1">Portada (primera página)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'cover')
                  }}
                  disabled={uploadingCover}
                  className="flex-1 text-xs text-neutral-600 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                {coverImage && (
                  <button
                    onClick={() => setCoverImage('')}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
                {uploadingCover && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                )}
              </div>
              {coverImage && (
                <div className="mt-2">
                  <img src={coverImage} alt="Portada" className="h-16 w-auto rounded border border-neutral-200" />
                </div>
              )}
            </div>

            {/* Back cover image */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-neutral-500 mb-1">Contraportada (última página)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'backcover')
                  }}
                  disabled={uploadingBackCover}
                  className="flex-1 text-xs text-neutral-600 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                />
                {backCoverImage && (
                  <button
                    onClick={() => setBackCoverImage('')}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
                {uploadingBackCover && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                )}
              </div>
              {backCoverImage && (
                <div className="mt-2">
                  <img src={backCoverImage} alt="Contraportada" className="h-16 w-auto rounded border border-neutral-200" />
                </div>
              )}
            </div>
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
              {previewPage === 0
                ? 'Portada'
                : backCoverImage && previewPage === totalPages + 1
                  ? 'Contraportada'
                  : `Página ${previewPage} de ${totalPages}`}
            </span>
            <button
              onClick={() => setPreviewPage(Math.min(totalPages + (backCoverImage ? 1 : 0), previewPage + 1))}
              disabled={previewPage >= totalPages + (backCoverImage ? 1 : 0)}
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
                  serie={serieLabel}
                  productCount={catalogProducts.length}
                  date={today}
                  customImage={coverImage}
                />
              </div>
            ) : backCoverImage && previewPage === totalPages + 1 ? (
              <div className="mx-auto" style={{ width: '800px' }}>
                <CatalogBackCover customImage={backCoverImage} />
              </div>
            ) : (
              <div className="mx-auto" style={{ width: '800px' }}>
                <div style={{ width: '800px', minHeight: '400px', padding: '20px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {/* Layout de edición de precios - muestra todos los productos */}
                  {(() => {
                    const pageProducts = pages[previewPage - 1] || []
                    const isElongatedPage = pageProducts.length > 0 && isElongatedProduct(pageProducts[0])

                    // Layout para productos alargados (vertical)
                    if (isElongatedPage) {
                      return (
                        <div className="flex flex-col gap-4 justify-center">
                          {pageProducts.map((product) => (
                            <div key={product.id} className="border border-neutral-200 rounded-lg overflow-hidden mx-auto" style={{ width: '750px' }}>
                              <div className="h-32 overflow-hidden">
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
                      )
                    }

                    // Layout para productos normales (2x2 grid)
                    return (
                      <div>
                        {/* Fila superior */}
                        <div className="flex gap-4 mb-4 justify-center">
                          {pageProducts.slice(0, 2).map((product) => (
                            <div key={product.id} className="border border-neutral-200 rounded-lg overflow-hidden" style={{ width: '368px' }}>
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
                        {/* Fila inferior */}
                        {pageProducts.slice(2).length > 0 && (
                          <div className="flex gap-4 justify-center">
                            {pageProducts.slice(2, 4).map((product) => (
                              <div key={product.id} className="border border-neutral-200 rounded-lg overflow-hidden" style={{ width: '368px' }}>
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
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden PDF render container - each child is one page */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }} ref={pdfContainerRef}>
        {/* Cover */}
        <CatalogCover
          serie={serieLabel}
          productCount={catalogProducts.length}
          date={today}
          customImage={coverImage}
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
        {/* Back cover */}
        {backCoverImage && (
          <CatalogBackCover customImage={backCoverImage} />
        )}
      </div>
    </div>
  )
}
