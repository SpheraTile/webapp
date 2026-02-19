'use client'

import { useTranslations } from 'next-intl'
import { IconX } from '@/components/ui/Icons'
import { FilterSection } from './FilterSection'
import { FilterCheckbox } from './FilterCheckbox'
import {
  OPCIONES_CALIDAD,
  OPCIONES_MATERIA_PRIMA,
  OPCIONES_ASPECTO,
  OPCIONES_ACABADO,
  OPCIONES_TIPO_PIEZA,
  OPCIONES_USO,
  OPCIONES_ESTADO_PRODUCTO,
} from '@/types'

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

interface FiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  filtros: FiltrosActivos
  onFiltrosChange: (filtros: FiltrosActivos) => void
  facets?: Facets
}

// Translation keys for filter labels
const LABELS_ESTADO_PRODUCTO: Record<string, string> = {
  normal: 'normal',
  oferta: 'offer',
  novedad: 'new',
}

const LABELS_TIPO_PIEZA: Record<string, string> = {
  base: 'base',
  decorado: 'decorated',
  multistep: 'multistep',
}

const LABELS_USO: Record<string, string> = {
  pavimento: 'floor',
  revestimiento: 'wall',
  pavimento_revestimiento: 'floorWall',
}

const LABELS_MATERIA_PRIMA: Record<string, string> = {
  'Porcelánico': 'porcelain',
  'Gres': 'stoneware',
  'Azulejo': 'tile',
}

const LABELS_ASPECTO: Record<string, string> = {
  'Blanco': 'white',
  'Cemento': 'cement',
  'Colores': 'colors',
  'Madera': 'wood',
  'Mármol': 'marble',
  'Onyx': 'onyx',
  'Piedra': 'stone',
  'Terracota': 'terracotta',
}

const LABELS_ACABADO: Record<string, string> = {
  'Mate': 'matte',
  'Pulido': 'polished',
  'Satinado': 'satin',
  'Texturizado': 'textured',
  'Antideslizante': 'nonSlip',
}

export function FiltersDrawer({
  isOpen,
  onClose,
  filtros,
  onFiltrosChange,
  facets,
}: FiltersDrawerProps) {
  const t = useTranslations('filters')
  const tCommon = useTranslations('common')

  // Helper to get count for a filter value
  const getCount = (category: keyof Facets, value: string): number | undefined => {
    if (!facets) return undefined
    return facets[category]?.[value] ?? 0
  }

  const toggleFiltro = (
    categoria: keyof FiltrosActivos,
    valor: string
  ) => {
    const actuales = filtros[categoria]
    const nuevos = actuales.includes(valor)
      ? actuales.filter((v) => v !== valor)
      : [...actuales, valor]
    onFiltrosChange({ ...filtros, [categoria]: nuevos })
  }

  const limpiarFiltros = () => {
    onFiltrosChange({
      formato: [],
      calidad: [],
      materia_prima: [],
      aspecto: [],
      acabado: [],
      tipo_pieza: [],
      uso: [],
      estado_producto: [],
    })
  }

  const totalFiltrosActivos =
    filtros.formato.length +
    filtros.calidad.length +
    filtros.materia_prima.length +
    filtros.aspecto.length +
    filtros.acabado.length +
    filtros.tipo_pieza.length +
    filtros.uso.length +
    filtros.estado_producto.length

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:inset-auto lg:transform-none lg:max-w-none lg:w-full lg:bg-transparent lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header del drawer (solo móvil) */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 lg:hidden">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-500 hover:text-neutral-700"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Contenido de filtros */}
        <div className="overflow-y-auto h-[calc(100%-140px)] lg:h-auto p-4 lg:p-0">
          {/* Formato (Tamaño) */}
          {facets?.formato && Object.keys(facets.formato).length > 0 && (
            <FilterSection titulo={t('size')} defaultOpen>
              {Object.keys(facets.formato).sort().map((fmt) => (
                <FilterCheckbox
                  key={fmt}
                  label={fmt}
                  checked={filtros.formato.includes(fmt)}
                  onChange={() => toggleFiltro('formato', fmt)}
                  count={getCount('formato', fmt)}
                />
              ))}
            </FilterSection>
          )}

          {/* Calidad */}
          <FilterSection titulo={t('quality')}>
            {OPCIONES_CALIDAD.map((cal) => (
              <FilterCheckbox
                key={cal}
                label={cal}
                checked={filtros.calidad.includes(cal)}
                onChange={() => toggleFiltro('calidad', cal)}
                count={getCount('calidad', cal)}
              />
            ))}
          </FilterSection>

          {/* Tipo de pieza */}
          <FilterSection titulo={t('pieceType')}>
            {OPCIONES_TIPO_PIEZA.map((tipo) => (
              <FilterCheckbox
                key={tipo}
                label={t(LABELS_TIPO_PIEZA[tipo])}
                checked={filtros.tipo_pieza.includes(tipo)}
                onChange={() => toggleFiltro('tipo_pieza', tipo)}
                count={getCount('tipo_pieza', tipo.toUpperCase())}
              />
            ))}
          </FilterSection>

          {/* Uso */}
          <FilterSection titulo={t('use')}>
            {OPCIONES_USO.map((u) => (
              <FilterCheckbox
                key={u}
                label={t(LABELS_USO[u])}
                checked={filtros.uso.includes(u)}
                onChange={() => toggleFiltro('uso', u)}
                count={getCount('uso', u.toUpperCase())}
              />
            ))}
          </FilterSection>

          {/* Estado del producto (Ofertas, Novedades) */}
          <FilterSection titulo={t('status')}>
            {OPCIONES_ESTADO_PRODUCTO.map((estado) => (
              <FilterCheckbox
                key={estado}
                label={t(LABELS_ESTADO_PRODUCTO[estado])}
                checked={filtros.estado_producto.includes(estado)}
                onChange={() => toggleFiltro('estado_producto', estado)}
                count={getCount('estado_producto', estado.toUpperCase())}
              />
            ))}
          </FilterSection>

          {/* Materia Prima */}
          <FilterSection titulo={t('material')}>
            {OPCIONES_MATERIA_PRIMA.map((materia) => (
              <FilterCheckbox
                key={materia}
                label={t(LABELS_MATERIA_PRIMA[materia])}
                checked={filtros.materia_prima.includes(materia)}
                onChange={() => toggleFiltro('materia_prima', materia)}
                count={getCount('materia_prima', materia.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
              />
            ))}
          </FilterSection>

          {/* Aspecto */}
          <FilterSection titulo={t('aspect')}>
            {OPCIONES_ASPECTO.map((asp) => (
              <FilterCheckbox
                key={asp}
                label={t(LABELS_ASPECTO[asp])}
                checked={filtros.aspecto.includes(asp)}
                onChange={() => toggleFiltro('aspecto', asp)}
                count={getCount('aspecto', asp.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
              />
            ))}
          </FilterSection>

          {/* Acabado */}
          <FilterSection titulo={t('finish')}>
            {OPCIONES_ACABADO.map((acab) => (
              <FilterCheckbox
                key={acab}
                label={t(LABELS_ACABADO[acab])}
                checked={filtros.acabado.includes(acab)}
                onChange={() => toggleFiltro('acabado', acab)}
                count={getCount('acabado', acab.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
              />
            ))}
          </FilterSection>
        </div>

        {/* Footer del drawer (solo móvil) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 bg-white lg:hidden">
          <div className="flex gap-3">
            {totalFiltrosActivos > 0 && (
              <button
                onClick={limpiarFiltros}
                className="btn-secondary flex-1"
              >
                {tCommon('clean')} ({totalFiltrosActivos})
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-primary flex-1"
            >
              {tCommon('viewResults')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
