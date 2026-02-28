'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconPlus, IconX, IconCheck } from '@/components/ui/Icons'

const OPCIONES = {
  calidad: ['COM', 'PRIMERA'],
  materia_prima: ['PORCELANICO', 'GRES', 'AZULEJO'],
  aspecto: ['BLANCO', 'CEMENTO', 'COLORES', 'MADERA', 'MARMOL', 'PIEDRA', 'TERRACOTA'],
  acabado: ['MATE', 'PULIDO', 'SATINADO', 'TEXTURIZADO', 'ANTIDESLIZANTE'],
  tipo_pieza: ['BASE', 'DECORADO', 'MULTISTEP'],
  uso: ['PAVIMENTO', 'REVESTIMIENTO', 'PAVIMENTO_REVESTIMIENTO'],
  estado_producto: ['NORMAL', 'OFERTA', 'NOVEDAD'],
  almacen: ['PRINCIPAL', 'LOGISTICS'],
}

const LABELS = {
  materia_prima: { PORCELANICO: 'Porcelánico', GRES: 'Gres', AZULEJO: 'Azulejo' },
  aspecto: { BLANCO: 'Blanco', CEMENTO: 'Cemento', COLORES: 'Colores', MADERA: 'Madera', MARMOL: 'Mármol', PIEDRA: 'Piedra', TERRACOTA: 'Terracota' },
  acabado: { MATE: 'Mate', PULIDO: 'Pulido', SATINADO: 'Satinado', TEXTURIZADO: 'Texturizado', ANTIDESLIZANTE: 'Antideslizante' },
  tipo_pieza: { BASE: 'Base', DECORADO: 'Decorado', MULTISTEP: 'Multistep' },
  uso: { PAVIMENTO: 'Pavimento', REVESTIMIENTO: 'Revestimiento', PAVIMENTO_REVESTIMIENTO: 'Pavimento y Revestimiento' },
  estado_producto: { NORMAL: 'Normal', OFERTA: 'Oferta', NOVEDAD: 'Novedad' },
  almacen: { PRINCIPAL: 'Principal', LOGISTICS: 'Logistics' },
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado para imágenes
  const [imagenPrincipal, setImagenPrincipal] = useState('')
  const [galeria, setGaleria] = useState<string[]>([])
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const mainInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nombre: '',
    referencia: '',
    serie: '',
    formato: '',
    precio_m2: '',
    stock_m2: '',
    calidad: 'PRIMERA',
    materia_prima: 'PORCELANICO',
    aspecto: 'CEMENTO',
    acabado: 'MATE',
    tipo_pieza: 'BASE',
    uso: 'PAVIMENTO',
    estado_producto: 'NORMAL',
    almacen: 'PRINCIPAL' as 'PRINCIPAL' | 'LOGISTICS',
    mostrar_en_grid: true,
    mostrar_en_catalogo: true,
    descripcion: '',
    m2_caja: '',
    piezas_caja: '',
    m2_palet: '',
    cajas_palet: '',
    peso_caja_kg: '',
    pedido_minimo_m2: '',
    hs_code: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Subir imagen principal a Bunny CDN
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMain(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'productos')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imagen')
      }

      setImagenPrincipal(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploadingMain(false)
    }
  }

  // Subir imágenes de galería a Bunny CDN
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingGallery(true)
    setError('')

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('files', file))
      formData.append('folder', 'productos/galeria')

      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imágenes')
      }

      const newUrls = data.uploaded.map((u: { url: string }) => u.url)
      setGaleria([...galeria, ...newUrls])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imágenes')
    } finally {
      setUploadingGallery(false)
      if (galleryInputRef.current) {
        galleryInputRef.current.value = ''
      }
    }
  }

  const removeGalleryImage = (index: number) => {
    setGaleria(galeria.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!imagenPrincipal) {
      setError('Debes subir una imagen principal')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          imagen: imagenPrincipal,
          galeria: galeria,
        }),
      })

      if (response.ok) {
        router.push('/almacen/productos')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear producto')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/almacen/productos"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Nuevo Producto</h1>
          <p className="text-neutral-500 mt-1">Añadir un nuevo producto al catálogo</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Imágenes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Imágenes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagen Principal */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Imagen Principal *
              </label>
              <input
                ref={mainInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleMainImageUpload}
                className="hidden"
                id="main-image"
              />

              {!imagenPrincipal ? (
                <label
                  htmlFor="main-image"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
                >
                  {uploadingMain ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  ) : (
                    <>
                      <IconPlus size={32} className="text-neutral-400 mb-2" />
                      <span className="text-sm text-neutral-500">Subir imagen principal</span>
                      <span className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP (máx. 10MB)</span>
                    </>
                  )}
                </label>
              ) : (
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-neutral-100">
                  <img
                    src={imagenPrincipal}
                    alt="Imagen principal"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="p-1.5 bg-green-500 rounded-full">
                      <IconCheck size={14} className="text-white" />
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImagenPrincipal('')
                        if (mainInputRef.current) mainInputRef.current.value = ''
                      }}
                      className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <IconX size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-neutral-400 mt-2">
                Se sube automáticamente a Bunny CDN
              </p>
            </div>

            {/* Galería */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Galería (opcional)
              </label>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                id="gallery-images"
              />

              <div className="grid grid-cols-3 gap-2">
                {galeria.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                    <img src={url} alt={`Galería ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <IconX size={12} className="text-white" />
                    </button>
                  </div>
                ))}

                {galeria.length < 8 && (
                  <label
                    htmlFor="gallery-images"
                    className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
                  >
                    {uploadingGallery ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    ) : (
                      <>
                        <IconPlus size={20} className="text-neutral-400" />
                        <span className="text-xs text-neutral-400 mt-1">Añadir</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                {galeria.length} de 8 imágenes
              </p>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Calacatta Gold Pulido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Referencia *
              </label>
              <input
                type="text"
                name="referencia"
                value={form.referencia}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="CAL-GOLD-120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Serie *
              </label>
              <input
                type="text"
                name="serie"
                value={form.serie}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Luxury Marble"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Formato *
              </label>
              <input
                type="text"
                name="formato"
                value={form.formato}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="120x120 cm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descripción del producto..."
              />
            </div>
          </div>
        </div>

        {/* Clasificación */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Clasificación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Calidad</label>
              <select
                name="calidad"
                value={form.calidad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.calidad.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Materia Prima</label>
              <select
                name="materia_prima"
                value={form.materia_prima}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.materia_prima.map(opt => (
                  <option key={opt} value={opt}>{LABELS.materia_prima[opt as keyof typeof LABELS.materia_prima]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Aspecto</label>
              <select
                name="aspecto"
                value={form.aspecto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.aspecto.map(opt => (
                  <option key={opt} value={opt}>{LABELS.aspecto[opt as keyof typeof LABELS.aspecto]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Acabado</label>
              <select
                name="acabado"
                value={form.acabado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.acabado.map(opt => (
                  <option key={opt} value={opt}>{LABELS.acabado[opt as keyof typeof LABELS.acabado]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo de Pieza</label>
              <select
                name="tipo_pieza"
                value={form.tipo_pieza}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.tipo_pieza.map(opt => (
                  <option key={opt} value={opt}>{LABELS.tipo_pieza[opt as keyof typeof LABELS.tipo_pieza]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Uso</label>
              <select
                name="uso"
                value={form.uso}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.uso.map(opt => (
                  <option key={opt} value={opt}>{LABELS.uso[opt as keyof typeof LABELS.uso]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Estado</label>
              <select
                name="estado_producto"
                value={form.estado_producto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.estado_producto.map(opt => (
                  <option key={opt} value={opt}>{LABELS.estado_producto[opt as keyof typeof LABELS.estado_producto]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Almacén y Visibilidad */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Almacén y Visibilidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Almacén</label>
              <select
                name="almacen"
                value={form.almacen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {OPCIONES.almacen.map(opt => (
                  <option key={opt} value={opt}>{LABELS.almacen[opt as keyof typeof LABELS.almacen]}</option>
                ))}
              </select>
              <p className="text-xs text-neutral-400 mt-1">
                Principal = punto verde, Logistics = punto azul
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="mostrar_en_grid"
                name="mostrar_en_grid"
                checked={form.mostrar_en_grid}
                onChange={(e) => setForm({ ...form, mostrar_en_grid: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="mostrar_en_grid" className="text-sm font-medium text-neutral-700">
                Mostrar indicador en grid
              </label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="mostrar_en_catalogo"
                name="mostrar_en_catalogo"
                checked={form.mostrar_en_catalogo}
                onChange={(e) => setForm({ ...form, mostrar_en_catalogo: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="mostrar_en_catalogo" className="text-sm font-medium text-neutral-700">
                Mostrar indicador en catálogo PDF
              </label>
            </div>
          </div>
        </div>

        {/* Precios y Stock */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Precios y Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Precio por m² (€) *
              </label>
              <input
                type="number"
                step="0.01"
                name="precio_m2"
                value={form.precio_m2}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="89.90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Stock (m²) *
              </label>
              <input
                type="number"
                step="0.01"
                name="stock_m2"
                value={form.stock_m2}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="450"
              />
            </div>
          </div>
        </div>

        {/* Empaquetado */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Información de Empaquetado</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                m² por Caja *
              </label>
              <input
                type="number"
                step="0.01"
                name="m2_caja"
                value={form.m2_caja}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="1.44"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Piezas por Caja *
              </label>
              <input
                type="number"
                name="piezas_caja"
                value={form.piezas_caja}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                m² por Palet *
              </label>
              <input
                type="number"
                step="0.01"
                name="m2_palet"
                value={form.m2_palet}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="43.2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Cajas por Palet *
              </label>
              <input
                type="number"
                name="cajas_palet"
                value={form.cajas_palet}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Peso por Caja (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                name="peso_caja_kg"
                value={form.peso_caja_kg}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Pedido Mínimo (m²) *
              </label>
              <input
                type="number"
                step="0.01"
                name="pedido_minimo_m2"
                value={form.pedido_minimo_m2}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="14.4"
              />
            </div>
          </div>
        </div>

        {/* Información Aduanera */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Información Aduanera</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                H.S. Code (Código Arancelario)
              </label>
              <input
                type="text"
                name="hs_code"
                value={form.hs_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="6907.21.00"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Código del Sistema Armonizado para exportación
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/almacen/productos"
            className="px-6 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !imagenPrincipal}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
