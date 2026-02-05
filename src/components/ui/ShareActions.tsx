'use client'

import { useState } from 'react'
import { exportToPDF, downloadPDF } from '@/lib/pdf'

interface ShareActionsProps {
  documentNumber: string
  documentType: 'pedido' | 'albaran' | 'factura'
  clientEmail?: string
  clientPhone?: string
  onPrint?: () => void
  printRef?: React.RefObject<HTMLElement | null>
}

export function ShareActions({
  documentNumber,
  documentType,
  clientEmail,
  clientPhone,
  onPrint,
  printRef,
}: ShareActionsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState(clientEmail || '')
  const [sending, setSending] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const documentLabels = {
    pedido: 'Pedido',
    albaran: 'Albarán',
    factura: 'Factura',
  }

  const getFilename = () => {
    return `${documentLabels[documentType]}_${documentNumber}`.replace(/\s+/g, '_')
  }

  const generatePDF = async (): Promise<Blob | null> => {
    if (!printRef?.current) {
      alert('No se puede generar el PDF. Elemento no encontrado.')
      return null
    }

    setGeneratingPDF(true)
    try {
      const blob = await exportToPDF({
        filename: getFilename(),
        element: printRef.current as HTMLElement,
        orientation: 'portrait',
      })
      return blob
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF')
      return null
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!printRef?.current) {
      alert('No se puede generar el PDF. Elemento no encontrado.')
      return
    }

    setGeneratingPDF(true)
    try {
      await downloadPDF({
        filename: getFilename(),
        element: printRef.current as HTMLElement,
        orientation: 'portrait',
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar el PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleWhatsApp = async () => {
    // Generate PDF and share
    const blob = await generatePDF()
    if (blob) {
      // Try to use Web Share API if available (mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], `${getFilename()}.pdf`, { type: 'application/pdf' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${documentLabels[documentType]} ${documentNumber}`,
              text: `${documentLabels[documentType]} ${documentNumber} de SPHERA TILE`,
            })
            return
          }
        } catch (error) {
          console.log('Web Share API not available, falling back to link')
        }
      }

      // Fallback: download PDF and open WhatsApp with message
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${getFilename()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Open WhatsApp
      const message = encodeURIComponent(`${documentLabels[documentType]} ${documentNumber} de SPHERA TILE. Te adjunto el PDF.`)
      const phone = clientPhone?.replace(/\D/g, '') || ''
      const whatsappUrl = phone
        ? `https://wa.me/${phone}?text=${message}`
        : `https://wa.me/?text=${message}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleEmail = async () => {
    if (!email) return

    setSending(true)
    try {
      // Generate PDF
      const blob = await generatePDF()
      if (blob) {
        // Download PDF first
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${getFilename()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // Then open email client
        const subject = encodeURIComponent(`${documentLabels[documentType]} ${documentNumber} - SPHERA TILE`)
        const body = encodeURIComponent(`Adjunto encontrarás ${documentLabels[documentType].toLowerCase()} ${documentNumber} de SPHERA TILE.\n\nSaludos,\nSPHERA TILE`)
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
        setShowEmailModal(false)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error al preparar el correo')
    } finally {
      setSending(false)
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Descargar PDF */}
        {printRef && (
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            title="Descargar PDF"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">{generatingPDF ? 'Generando...' : 'PDF'}</span>
          </button>
        )}

        {/* Email */}
        <button
          onClick={() => setShowEmailModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          title="Enviar por correo"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Email</span>
        </button>

        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          disabled={generatingPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors disabled:opacity-50"
          title="Compartir por WhatsApp"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Imprimir */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          title="Imprimir"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>

      {/* Modal de Email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Enviar {documentLabels[documentType]} por Email
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              Se descargará el PDF y se abrirá tu cliente de correo para que lo adjuntes.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleEmail}
                disabled={!email || sending || generatingPDF}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {sending || generatingPDF ? 'Preparando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
