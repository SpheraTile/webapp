'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { SearchBar } from '@/components/ui/SearchBar'
import { ProductGrid } from '@/components/producto/ProductGrid'
import { FiltersDrawer } from '@/components/filtros/FiltersDrawer'
import { IconFilter } from '@/components/ui/Icons'
import { Producto } from '@/types'

interface FiltrosActivos {
  formato: string[]
  calidad: string[]
  materia_prima: string[]
  aspecto: string[]
  acabado: string[]
  tipo_pieza: string[]
  uso: string[]
  estado_producto: string[]
}

const filtrosIniciales: FiltrosActivos = {
  formato: [],
  calidad: [],
  materia_prima: [],
  aspecto: [],
  acabado: [],
  tipo_pieza: [],
  uso: [],
  estado_producto: [],
}

// Mapeo de valores frontend a valores de BD (enum en mayúsculas)
const mapToDBValue = (key: string, value: string): string => {
  const maps: Record<string, Record<string, string>> = {
    materia_prima: {
      'Porcelánico': 'PORCELANICO',
      'Gres': 'GRES',
      'Azulejo': 'AZULEJO',
    },
    aspecto: {
      'Blanco': 'BLANCO',
      'Cemento': 'CEMENTO',
      'Colores': 'COLORES',
      'Madera': 'MADERA',
      'Mármol': 'MARMOL',
      'Piedra': 'PIEDRA',
      'Terracota': 'TERRACOTA',
    },
    acabado: {
      'Mate': 'MATE',
      'Pulido': 'PULIDO',
      'Satinado': 'SATINADO',
      'Texturizado': 'TEXTURIZADO',
    },
    tipo_pieza: {
      'base': 'BASE',
      'decorado': 'DECORADO',
      'multistep': 'MULTISTEP',
    },
    uso: {
      'pavimento': 'PAVIMENTO',
      'revestimiento': 'REVESTIMIENTO',
      'pavimento_revestimiento': 'PAVIMENTO_REVESTIMIENTO',
    },
    estado_producto: {
      'normal': 'NORMAL',
      'oferta': 'OFERTA',
      'novedad': 'NOVEDAD',
    },
  }
  return maps[key]?.[value] || value
}

// Mapeo de valores de BD a valores frontend
const mapFromDBValue = (key: string, value: string): string => {
  const maps: Record<string, Record<string, string>> = {
    materia_prima: {
      'PORCELANICO': 'Porcelánico',
      'GRES': 'Gres',
      'AZULEJO': 'Azulejo',
    },
    aspecto: {
      'BLANCO': 'Blanco',
      'CEMENTO': 'Cemento',
      'COLORES': 'Colores',
      'MADERA': 'Madera',
      'MARMOL': 'Mármol',
      'PIEDRA': 'Piedra',
      'TERRACOTA': 'Terracota',
    },
    acabado: {
      'MATE': 'Mate',
      'PULIDO': 'Pulido',
      'SATINADO': 'Satinado',
      'TEXTURIZADO': 'Texturizado',
    },
    tipo_pieza: {
      'BASE': 'base',
      'DECORADO': 'decorado',
      'MULTISTEP': 'multistep',
    },
    uso: {
      'PAVIMENTO': 'pavimento',
      'REVESTIMIENTO': 'revestimiento',
      'PAVIMENTO_REVESTIMIENTO': 'pavimento_revestimiento',
    },
    estado_producto: {
      'NORMAL': 'normal',
      'OFERTA': 'oferta',
      'NOVEDAD': 'novedad',
    },
  }
  return maps[key]?.[value] || value
}

interface Facets {
  formato: Record<string, number>
  calidad: Record<string, number>
  materia_prima: Record<string, number>
  aspecto: Record<string, number>
  acabado: Record<string, number>
  tipo_pieza: Record<string, number>
  uso: Record<string, number>
  estado_producto: Record<string, number>
}

function ProductosContent() {
  const searchParams = useSearchParams()
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const [busqueda, setBusqueda] = useState('')
  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosActivos>(filtrosIniciales)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [facets, setFacets] = useState<Facets | undefined>(undefined)
  const [page, setPage] = useState(1)
  const limit = 50

  // Leer filtros de la URL al cargar
  useEffect(() => {
    const nuevasFiltros: FiltrosActivos = { ...filtrosIniciales }

    // Leer cada tipo de filtro de la URL
    const formato = searchParams.get('formato')
    if (formato) {
      nuevasFiltros.formato = [formato]
    }

    const estadoProducto = searchParams.get('estado_producto')
    if (estadoProducto) {
      nuevasFiltros.estado_producto = [estadoProducto]
    }

    const calidad = searchParams.get('calidad')
    if (calidad) {
      nuevasFiltros.calidad = [calidad]
    }

    const materiaPrima = searchParams.get('materia_prima')
    if (materiaPrima) {
      nuevasFiltros.materia_prima = [materiaPrima]
    }

    const aspecto = searchParams.get('aspecto')
    if (aspecto) {
      nuevasFiltros.aspecto = [aspecto]
    }

    const acabado = searchParams.get('acabado')
    if (acabado) {
      nuevasFiltros.acabado = [acabado]
    }

    const tipoPieza = searchParams.get('tipo_pieza')
    if (tipoPieza) {
      nuevasFiltros.tipo_pieza = [tipoPieza]
    }

    const uso = searchParams.get('uso')
    if (uso) {
      nuevasFiltros.uso = [uso]
    }

    setFiltrosActivos(nuevasFiltros)
  }, [searchParams])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filtrosActivos, busqueda])

  // Fetch productos from API
  const fetchProductos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (busqueda) params.set('busqueda', busqueda)

      // Pagination
      params.set('page', page.toString())
      params.set('limit', limit.toString())

      // Mapear valores a formato DB
      filtrosActivos.formato.forEach(v => params.append('formato', v))
      filtrosActivos.calidad.forEach(v => params.append('calidad', v))
      filtrosActivos.materia_prima.forEach(v => params.append('materia_prima', mapToDBValue('materia_prima', v)))
      filtrosActivos.aspecto.forEach(v => params.append('aspecto', mapToDBValue('aspecto', v)))
      filtrosActivos.acabado.forEach(v => params.append('acabado', mapToDBValue('acabado', v)))
      filtrosActivos.tipo_pieza.forEach(v => params.append('tipo_pieza', mapToDBValue('tipo_pieza', v)))
      filtrosActivos.uso.forEach(v => params.append('uso', mapToDBValue('uso', v)))
      filtrosActivos.estado_producto.forEach(v => params.append('estado_producto', mapToDBValue('estado_producto', v)))

      const response = await fetch(`/api/productos?${params.toString()}`)
      const data = await response.json()

      // Mapear valores de DB a frontend
      const productosNormalizados = data.productos.map((p: any) => ({
        ...p,
        materia_prima: mapFromDBValue('materia_prima', p.materia_prima),
        aspecto: mapFromDBValue('aspecto', p.aspecto),
        acabado: mapFromDBValue('acabado', p.acabado),
        tipo_pieza: mapFromDBValue('tipo_pieza', p.tipo_pieza),
        uso: mapFromDBValue('uso', p.uso),
        estado_producto: mapFromDBValue('estado_producto', p.estado_producto),
      }))

      setProductos(productosNormalizados)
      setTotal(data.pagination.total)
      if (data.facets) {
        setFacets(data.facets)
      }
    } catch (error) {
      console.error('Error fetching productos:', error)
    } finally {
      setLoading(false)
    }
  }, [busqueda, filtrosActivos, page, limit])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProductos()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchProductos])

  // Contar filtros activos
  const totalFiltrosActivos =
    filtrosActivos.formato.length +
    filtrosActivos.calidad.length +
    filtrosActivos.materia_prima.length +
    filtrosActivos.aspecto.length +
    filtrosActivos.acabado.length +
    filtrosActivos.tipo_pieza.length +
    filtrosActivos.uso.length +
    filtrosActivos.estado_producto.length

  const totalPages = Math.ceil(total / limit)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navegación Desktop */}
      <DesktopNav />

      {/* Header Mobile + Barra de acciones - Todo sticky junto */}
      <div className="lg:hidden sticky top-0 z-40 bg-white">
        <Header
          titulo={t('title')}
          showBack
          showSearch
          sticky={false}
          onSearchClick={() => setMostrarBusqueda(!mostrarBusqueda)}
        />

        {/* Barra de búsqueda expandible (mobile) */}
        {mostrarBusqueda && (
          <div className="px-4 py-3 border-b border-neutral-100">
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder={t('searchPlaceholder')}
            />
          </div>
        )}

        {/* Barra de acciones Mobile */}
        <div className="border-b border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Chip de productos */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-neutral-100 rounded-full text-sm font-medium">
                {t('title')}
              </span>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setMostrarFiltros(true)}
              className="relative p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <IconFilter size={24} />
              {totalFiltrosActivos > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {totalFiltrosActivos}
                </span>
              )}
            </button>
          </div>

          {/* Contador */}
          <div className="flex items-center justify-between px-4 py-2 text-sm text-neutral-500">
            <span>{tCommon('showing')} {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} {tCommon('of')} {total} {tCommon('elements')}</span>
          </div>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden lg:block pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{t('catalogTitle')}</h1>
              <p className="text-neutral-600 mt-1">
                {total} {t('availableProducts')}
              </p>
            </div>
            <div className="w-96">
              <SearchBar
                value={busqueda}
                onChange={setBusqueda}
                placeholder={t('searchPlaceholder')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex lg:max-w-7xl lg:mx-auto lg:gap-8 min-h-[500px]">
        {/* Sidebar de filtros (desktop) */}
        <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-neutral-100 min-h-[calc(100vh-12rem)]">
          <div className="sticky top-28 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">{t('filters')}</h2>
              {totalFiltrosActivos > 0 && (
                <button
                  onClick={() => setFiltrosActivos(filtrosIniciales)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {tCommon('clearAll')}
                </button>
              )}
            </div>
            <FiltersDrawer
              isOpen={true}
              onClose={() => { }}
              filtros={filtrosActivos}
              onFiltrosChange={setFiltrosActivos}
              facets={facets}
            />
          </div>
        </aside>

        {/* Grid de productos */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col">
          {/* Vista toggle para desktop */}
          {loading ? (
            <div className="flex items-center justify-center py-20 flex-1">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-20 flex-1">
              <p className="text-neutral-500">{t('noProducts')}</p>
              <button
                onClick={() => {
                  setFiltrosActivos(filtrosIniciales)
                  setBusqueda('')
                }}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <>
              <ProductGrid productos={productos} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {tCommon('previous')}
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      // Show first, last, current, and surrounding pages
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      ) {
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${p === page
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50'
                              }`}
                          >
                            {p}
                          </button>
                        )
                      } else if (
                        (p === page - 2 && p > 1) ||
                        (p === page + 2 && p < totalPages)
                      ) {
                        return (
                          <span key={p} className="px-2 text-neutral-500">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {tCommon('next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drawer de filtros (mobile only) */}
      <div className="lg:hidden">
        <FiltersDrawer
          isOpen={mostrarFiltros}
          onClose={() => setMostrarFiltros(false)}
          filtros={filtrosActivos}
          onFiltrosChange={setFiltrosActivos}
          facets={facets}
        />
      </div>
    </div>
  )
}

function ProductosLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<ProductosLoading />}>
      <ProductosContent />
    </Suspense>
  )
}
