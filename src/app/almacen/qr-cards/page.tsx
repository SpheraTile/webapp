'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { QRCard } from '@/components/producto/QRCard'
import { useToast } from '@/components/ui/Toast'
import { Producto } from '@/types'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'

export default function QRCardsPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [zipProgress, setZipProgress] = useState(0)
  const singleQrRef = useRef<HTMLDivElement>(null)
  const [renderProduct, setRenderProduct] = useState<Producto | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos?limit=1000')
      const data = await response.json()
      setProductos(data.productos || [])
    } catch (error) {
      console.error('Error fetching productos:', error)
      showToast('Error al cargar productos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.referencia.toLowerCase().includes(search.toLowerCase()) ||
    p.formato.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProductos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProductos.map(p => p.id)))
    }
  }

  const generateQRBlob = async (producto: Producto): Promise<{ blob: Blob, filename: string } | null> => {
    setRenderProduct(producto)

    // Wait for render
    await new Promise(r => setTimeout(r, 100))

    const el = singleQrRef.current
    if (!el) return null

    // Configure element for capture
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    el.style.top = '0'
    el.style.display = 'block'

    try {
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach((clonedEl) => {
            const style = (clonedEl as HTMLElement).style
            const computed = clonedDoc.defaultView?.getComputedStyle(clonedEl)
            if (computed?.color?.includes('oklch')) style.color = '#000000'
            if (computed?.backgroundColor?.includes('oklch')) style.backgroundColor = '#ffffff'
            if (computed?.borderColor?.includes('oklch')) style.borderColor = '#d4d4d4'
          })
        },
      })

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) resolve(null)
          else resolve({
            blob,
            filename: `QR_${producto.referencia}.png`
          })
        }, 'image/png')
      })
    } finally {
      // Clean up styles
      el.style.position = ''
      el.style.left = ''
      el.style.top = ''
      el.style.display = 'none'
    }
  }

  const handleDownloadSingle = async (producto: Producto) => {
    if (downloadingId || downloadingZip) return
    setDownloadingId(producto.id)

    try {
      const result = await generateQRBlob(producto)
      if (result) {
        const url = URL.createObjectURL(result.blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        showToast(`QR de ${producto.referencia} descargado`, 'success')
      } else {
        showToast('Error al generar la imagen', 'error')
      }
    } catch (error) {
      console.error('Error generating image:', error)
      showToast('Error al generar la imagen', 'error')
    } finally {
      setDownloadingId(null)
      setRenderProduct(null)
    }
  }

  const handleDownloadMultiple = async () => {
    if (selectedIds.size === 0 || downloadingZip) return

    setDownloadingZip(true)
    setZipProgress(0)
    const zip = new JSZip()
    const selectedProds = productos.filter(p => selectedIds.has(p.id))
    let count = 0

    try {
      for (const producto of selectedProds) {
        const result = await generateQRBlob(producto)
        if (result) {
          zip.file(result.filename, result.blob)
        }
        count++
        setZipProgress(Math.round((count / selectedProds.length) * 100))
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `QR_Cards_(${selectedIds.size}).zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast(`${selectedIds.size} QRs descargados en ZIP`, 'success')
      setSelectedIds(new Set()) // Optional: clear selection after download
    } catch (error) {
      console.error('Error generating ZIP:', error)
      showToast('Error al generar el ZIP', 'error')
    } finally {
      setDownloadingZip(false)
      setZipProgress(0)
      setRenderProduct(null)
    }
  }

  return (
    <>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Tarjetas QR</h1>
          <p className="text-neutral-500 mt-1">Descarga las tarjetas QR de tus productos como imagen individual o en grupo</p>
        </div>

        {/* Search & Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative max-w-md w-full">
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
                placeholder="Buscar por nombre, referencia, formato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end bg-primary-50 p-2 rounded-lg border border-primary-100 animate-in fade-in slide-in-from-top-2">
                <span className="text-sm font-medium text-primary-900 px-2">
                  {selectedIds.size} seleccionados
                </span>
                <button
                  onClick={handleDownloadMultiple}
                  disabled={downloadingZip}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {downloadingZip ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating ZIP {zipProgress}%
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar ZIP
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Product List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Productos</h2>
                  <p className="text-sm text-neutral-500">{filteredProductos.length} productos encontratos</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-neutral-600 hover:text-neutral-900 font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    {selectedIds.size === filteredProductos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-neutral-100">
                {filteredProductos.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => toggleSelect(producto.id)}
                    className={`p-4 cursor-pointer transition-colors ${selectedIds.has(producto.id) ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedIds.has(producto.id) ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'}`}>
                        {selectedIds.has(producto.id) && (
                          <svg width="14" height="14" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-900 truncate">{producto.nombre}</div>
                        <div className="text-sm text-neutral-500">{producto.referencia} · {producto.formato}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadSingle(producto) }}
                        disabled={downloadingId === producto.id}
                        className="p-2 text-neutral-400 hover:text-primary-600 transition-colors flex-shrink-0 disabled:opacity-50"
                        title="Descargar QR"
                      >
                        {downloadingId === producto.id ? (
                          <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-primary-600"></div>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredProductos.length && filteredProductos.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Referencia
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Formato
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider w-20 text-center">
                        QR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredProductos.map(producto => (
                      <tr
                        key={producto.id}
                        onClick={() => toggleSelect(producto.id)}
                        className={`cursor-pointer transition-colors ${selectedIds.has(producto.id) ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(producto.id)}
                            onChange={() => toggleSelect(producto.id)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="font-medium text-neutral-900">{producto.nombre}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-mono text-sm">
                          {producto.referencia}
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          {producto.formato}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadSingle(producto) }}
                            disabled={downloadingId === producto.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                            title="Descargar QR"
                          >
                            {downloadingId === producto.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            ) : (
                              <>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descargar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProductos.length === 0 && (
                <div className="px-6 py-12 text-center text-neutral-500">
                  No se encontraron productos
                </div>
              )}
            </div>
          </>
        )}

        {/* Hidden render area for QR generation */}
        <div ref={singleQrRef} style={{ display: 'none' }}>
          {renderProduct && <QRCard producto={renderProduct} />}
        </div>
      </div>
    </>
  )
}
