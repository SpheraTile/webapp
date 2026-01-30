'use client'

import { useState } from 'react'

interface ShareActionsProps {
  title: string
  documentNumber: string
  documentType: 'pedido' | 'albaran' | 'factura'
  clientEmail?: string
  clientPhone?: string
  onPrint?: () => void
}

export function ShareActions({
  title,
  documentNumber,
  documentType,
  clientEmail,
  clientPhone,
  onPrint,
}: ShareActionsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState(clientEmail || '')
  const [sending, setSending] = useState(false)

  const documentLabels = {
    pedido: 'Pedido',
    albaran: 'Albarán',
    factura: 'Factura',
  }

  const getMessage = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${documentLabels[documentType]} ${documentNumber} de SPHERA TILE. Ver documento: ${baseUrl}${window.location.pathname}`
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(getMessage())
    const phone = clientPhone?.replace(/\D/g, '') || ''
    const url = phone
      ? `https://wa.me/${phone}?text=${message}`
      : `https://wa.me/?text=${message}`
    window.open(url, '_blank')
  }

  const handleTelegram = () => {
    const message = encodeURIComponent(getMessage())
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${message}`, '_blank')
  }

  const handleEmail = async () => {
    if (!email) return

    setSending(true)
    try {
      // Por ahora, abrimos el cliente de correo del sistema
      const subject = encodeURIComponent(`${documentLabels[documentType]} ${documentNumber} - SPHERA TILE`)
      const body = encodeURIComponent(getMessage())
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
      setShowEmailModal(false)
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error al enviar el correo')
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
      <div className="flex items-center gap-2">
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
          className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors"
          title="Compartir por WhatsApp"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="hidden sm:inline">WhatsApp</span>
        </button>

        {/* Telegram */}
        <button
          onClick={handleTelegram}
          className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:bg-[#006699] transition-colors"
          title="Compartir por Telegram"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="hidden sm:inline">Telegram</span>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Enviar {documentLabels[documentType]} por Email
            </h3>
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
                disabled={!email || sending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
