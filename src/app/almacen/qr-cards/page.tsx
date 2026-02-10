'use client'

import { useState, useEffect, useRef } from 'react'
import { QRCard, qrCardPrintStyles } from '@/components/producto/QRCard'
import { useToast } from '@/components/ui/Toast'

interface Producto {
  id: string
  slug: string
  nombre: string
  referencia: string
  formato: string
  imagen: string
}

export default function QRCardsPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const printAreaRef = useRef<HTMLDivElement>(null)
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

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.referencia.toLowerCase().includes(search.toLowerCase()) ||
    p.formato.toLowerCase().includes(search.toLowerCase())
  )

  const selectedProductos = productos.filter(p => selectedIds.has(p.id))

  const handlePrint = () => {
    if (selectedIds.size === 0) {
      showToast('Selecciona al menos un producto', 'error')
      return
    }
    window.print()
  }

  const handleDownload = async () => {
    if (selectedIds.size === 0) {
      showToast('Selecciona al menos un producto', 'error')
      return
    }

    showToast('Generando PDF...', 'info')

    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const cardWidth = 60
      const cardHeight = 45
      const margin = 5
      const cardsPerRow = Math.floor((210 - margin * 2) / (cardWidth + margin))
      const rowsPerPage = Math.floor((297 - margin * 2) / (cardHeight + margin))

      // Crear un contenedor temporal para renderizar las tarjetas
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = `${cardsPerRow * (cardWidth + margin)}mm`
      tempContainer.style.background = 'white'
      document.body.appendChild(tempContainer)

      // Procesar en lotes de páginas
      const productosArray = selectedProductos
      const totalPages = Math.ceil(productosArray.length / (cardsPerRow * rowsPerPage))

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage()
        }

        tempContainer.innerHTML = ''

        const startIndex = page * cardsPerRow * rowsPerPage
        const endIndex = Math.min(startIndex + cardsPerRow * rowsPerPage, productosArray.length)
        const pageProductos = productosArray.slice(startIndex, endIndex)

        // Renderizar tarjetas en esta página
        for (const producto of pageProductos) {
          const card = document.createElement('div')
          card.className = 'qr-card'
          card.style.width = `${cardWidth}mm`
          card.style.height = `${cardHeight}mm`
          card.style.border = '2px solid #171717'
          card.style.padding = '2mm'
          card.style.display = 'inline-block'
          card.style.fontFamily = 'Arial, sans-serif'
          card.innerHTML = `
            <div style="text-align: center; margin-bottom: 1mm;">
              <div style="font-size: 6px; font-weight: bold; letter-spacing: 0.5px;">SPHERA TILE</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; height: 22mm;">
              <div style="width: 20mm; height: 20mm; background: #f5f5f5; overflow: hidden; position: relative;">
                <img src="${producto.imagen}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div style="width: 22mm; height: 22mm; display: flex; align-items: center; justify-content: center;">
                <canvas id="qr-${producto.id}" width="80" height="80"></canvas>
              </div>
            </div>
            <div style="text-align: center; margin-top: 1mm;">
              <div style="font-size: 5px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 1mm;" title="${producto.nombre}">${producto.nombre}</div>
              <div style="display: flex; justify-content: space-between; font-size: 4px; color: #525252; padding: 0 1mm; margin-top: 0.5mm;">
                <span style="font-weight: 500;">${producto.formato}</span>
                <span style="font-family: monospace;">${producto.referencia}</span>
              </div>
            </div>
          `
          tempContainer.appendChild(card)

          // Generar QR code
          const { QRCodeCanvas } = await import('qrcode.react')
          const canvas = card.querySelector(`#qr-${producto.id}`) as HTMLCanvasElement
          if (canvas) {
            const qrValue = `https://spheratile.com/producto/${producto.slug}`
            const { default: QRCode } = await import('qrcode')
            await QRCode.toCanvas(canvas, qrValue, {
              width: 80,
              margin: 0,
              errorCorrectionLevel: 'M',
            })
          }
        }

        // Convertir a imagen y añadir al PDF
        const canvas = await html2canvas(tempContainer, {
          scale: 3,
          useCORS: true,
          logging: false,
        })

        const imgData = canvas.toDataURL('image/png')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - margin * 2, pdfHeight - margin * 2)
      }

      document.body.removeChild(tempContainer)

      // Generar un timestamp único para el nombre del archivo
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const fileName = `qr-cards-spheratile-${timestamp}.pdf`

      pdf.save(fileName)
      showToast(`PDF generado: ${fileName}`, 'success')
    } catch (error) {
      console.error('Error generating PDF:', error)
      showToast('Error al generar PDF', 'error')
    }
  }

  return (
    <>
      <style>{qrCardPrintStyles}</style>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Tarjetas QR</h1>
          <p className="text-neutral-500 mt-1">Genera e imprime códigos QR para productos (60mm x 45mm)</p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
          {/* Search */}
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
              placeholder="Buscar por nombre, referencia, formato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Selection info and actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">{selectedIds.size}</span> de {filteredProductos.length} productos seleccionados
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                {selectedIds.size === filteredProductos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
              <button
                onClick={handlePrint}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button
                onClick={handleDownload}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Preview Grid - Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Vista Previa (Seleccionados)</h2>
              {selectedProductos.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  No hay productos seleccionados. Selecciona productos de la lista abajo para ver la vista previa.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {selectedProductos.map(producto => (
                    <div key={producto.id} className="flex justify-center">
                      <QRCard producto={producto} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product List - Selection */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Seleccionar Productos</h2>
                <p className="text-sm text-neutral-500">Haz clic para seleccionar productos para generar tarjetas QR</p>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-neutral-100">
                {filteredProductos.map(producto => (
                  <div
                    key={producto.id}
                    onClick={() => toggleSelect(producto.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedIds.has(producto.id) ? 'bg-primary-50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedIds.has(producto.id) ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'
                      }`}>
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
                          className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredProductos.map(producto => (
                      <tr
                        key={producto.id}
                        onClick={() => toggleSelect(producto.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedIds.has(producto.id) ? 'bg-primary-50' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(producto.id)}
                            onChange={() => toggleSelect(producto.id)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
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

        {/* Print Area - Hidden from view, used for printing */}
        <div id="qr-cards-print-area" ref={printAreaRef} className="hidden print:block">
          {selectedProductos.map(producto => (
            <QRCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </>
  )
}
