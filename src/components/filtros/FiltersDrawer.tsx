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
  calidad: string[]
  materia_prima: string[]
  aspecto: string[]
  acabado: string[]
  tipo_pieza: string[]
  uso: string[]
  estado_producto: string[]
}

interface FiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  filtros: FiltrosActivos
  onFiltrosChange: (filtros: FiltrosActivos) => void
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
  'Piedra': 'stone',
  'Terracota': 'terracotta',
}

const LABELS_ACABADO: Record<string, string> = {
  'Mate': 'matte',
  'Pulido': 'polished',
  'Satinado': 'satin',
  'Texturizado': 'textured',
}

export function FiltersDrawer({
  isOpen,
  onClose,
  filtros,
  onFiltrosChange,
}: FiltersDrawerProps) {
  const t = useTranslations('filters')
  const tCommon = useTranslations('common')

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
          {/* Estado del producto (Ofertas, Novedades) */}
          <FilterSection titulo={t('status')} defaultOpen>
            {OPCIONES_ESTADO_PRODUCTO.map((estado) => (
              <FilterCheckbox
                key={estado}
                label={t(LABELS_ESTADO_PRODUCTO[estado])}
                checked={filtros.estado_producto.includes(estado)}
                onChange={() => toggleFiltro('estado_producto', estado)}
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
              />
            ))}
          </FilterSection>

          {/* Uso */}
          <FilterSection titulo={t('use')}>
            {OPCIONES_USO.map((uso) => (
              <FilterCheckbox
                key={uso}
                label={t(LABELS_USO[uso])}
                checked={filtros.uso.includes(uso)}
                onChange={() => toggleFiltro('uso', uso)}
              />
            ))}
          </FilterSection>

          <FilterSection titulo={t('quality')}>
            {OPCIONES_CALIDAD.map((calidad) => (
              <FilterCheckbox
                key={calidad}
                label={calidad}
                checked={filtros.calidad.includes(calidad)}
                onChange={() => toggleFiltro('calidad', calidad)}
              />
            ))}
          </FilterSection>

          <FilterSection titulo={t('material')}>
            {OPCIONES_MATERIA_PRIMA.map((materia) => (
              <FilterCheckbox
                key={materia}
                label={t(LABELS_MATERIA_PRIMA[materia])}
                checked={filtros.materia_prima.includes(materia)}
                onChange={() => toggleFiltro('materia_prima', materia)}
              />
            ))}
          </FilterSection>

          <FilterSection titulo={t('aspect')}>
            {OPCIONES_ASPECTO.map((aspecto) => (
              <FilterCheckbox
                key={aspecto}
                label={t(LABELS_ASPECTO[aspecto])}
                checked={filtros.aspecto.includes(aspecto)}
                onChange={() => toggleFiltro('aspecto', aspecto)}
              />
            ))}
          </FilterSection>

          <FilterSection titulo={t('finish')}>
            {OPCIONES_ACABADO.map((acabado) => (
              <FilterCheckbox
                key={acabado}
                label={t(LABELS_ACABADO[acabado])}
                checked={filtros.acabado.includes(acabado)}
                onChange={() => toggleFiltro('acabado', acabado)}
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
