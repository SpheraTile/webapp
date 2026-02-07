'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { IconHelp, IconChevronDown } from '@/components/ui/Icons'

const FAQ_ITEMS = [
  {
    pregunta: '¿Cómo puedo realizar un pedido?',
    respuesta: 'Navega por el catálogo de productos, selecciona los que necesites y añádelos a tu cesta. Cuando estés listo, accede a la cesta y completa el proceso de pedido.',
  },
  {
    pregunta: '¿Cuál es el pedido mínimo?',
    respuesta: 'El pedido mínimo varía según el producto. Puedes ver el pedido mínimo en m² en la ficha de cada producto.',
  },
  {
    pregunta: '¿Cuánto tarda en llegar mi pedido?',
    respuesta: 'Los pedidos se preparan en 24-48 horas laborables. El tiempo de envío depende de tu ubicación y el transportista seleccionado.',
  },
  {
    pregunta: '¿Puedo modificar o cancelar un pedido?',
    respuesta: 'Puedes solicitar modificaciones o cancelaciones mientras el pedido esté en estado "Pendiente". Contacta con tu comercial asignado para gestionar cambios.',
  },
  {
    pregunta: '¿Cómo puedo ver mis facturas?',
    respuesta: 'Las facturas se envían por email una vez procesado el pedido. También puedes solicitarlas a tu comercial asignado.',
  },
]

export default function AyudaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white lg:bg-neutral-50">
      <DesktopNav />
      <div className="lg:hidden">
        <Header titulo="Ayuda y Soporte" showBack />
      </div>

      <div className="lg:pt-20 lg:max-w-2xl lg:mx-auto lg:px-6 lg:py-12">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Ayuda y Soporte</h1>
            <p className="text-neutral-500 mt-1">Preguntas frecuentes y contacto</p>
          </div>
          <Link
            href="/cuenta"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

        {/* Contacto directo */}
        <div className="p-4 lg:p-0 lg:mb-6">
          <div className="p-6 bg-primary-50 border border-primary-200 rounded-xl lg:rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <IconHelp size={24} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-primary-900">¿Necesitas ayuda?</h2>
                <p className="text-primary-700 text-sm mt-1">
                  Contacta con nuestro equipo de atención al cliente
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-primary-800 text-sm">
                    <strong>Email:</strong> info@spheratile.es
                  </p>
                  <p className="text-primary-800 text-sm">
                    <strong>Teléfono:</strong> +34 633 909 095
                  </p>
                  <p className="text-primary-800 text-sm">
                    <strong>Horario:</strong> L-V 9:00 - 18:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Preguntas frecuentes</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem key={index} pregunta={item.pregunta} respuesta={item.respuesta} />
            ))}
          </div>
        </div>

        {/* GDPR / Privacidad */}
        <DataDeletionSection />
      </div>
    </div>
  )
}

function FAQItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  return (
    <details className="group">
      <summary className="flex items-center justify-between p-4 lg:p-6 cursor-pointer list-none hover:bg-neutral-50 transition-colors">
        <span className="font-medium text-neutral-900 pr-4">{pregunta}</span>
        <IconChevronDown
          size={20}
          className="text-neutral-400 transition-transform group-open:rotate-180 flex-shrink-0"
        />
      </summary>
      <div className="px-4 pb-4 lg:px-6 lg:pb-6">
        <p className="text-neutral-600 text-sm">{respuesta}</p>
      </div>
    </details>
  )
}

function DataDeletionSection() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleRequest = async () => {
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/gdpr/solicitar-borrado', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud')
      }

      setSent(true)
      setShowConfirm(false)
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-6 lg:bg-white lg:rounded-2xl lg:shadow-sm lg:overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-neutral-100">
        <h2 className="font-semibold text-neutral-900">Privacidad y datos personales</h2>
      </div>
      <div className="p-4 lg:p-6">
        <p className="text-sm text-neutral-600 mb-4">
          Conforme al Reglamento General de Protección de Datos (RGPD), tienes derecho a solicitar
          la eliminación de tus datos personales. Al realizar esta solicitud, nuestro equipo
          revisará tu petición y te contactará para confirmar el proceso.
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Solicitud enviada correctamente. Nos pondremos en contacto contigo para gestionar tu petición.
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Solicitar borrado de mis datos
            </button>
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-3">
                Confirmar solicitud de borrado
              </h3>
              <p className="text-sm text-neutral-600 mb-2">
                Estás a punto de solicitar el borrado de tus datos personales.
              </p>
              <p className="text-sm text-neutral-600 mb-4">
                Nuestro equipo revisará la solicitud teniendo en cuenta las obligaciones legales
                de conservación de datos (facturas, contratos, etc.) y te contactará para
                informarte del resultado.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 px-4 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRequest}
                  disabled={sending}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : 'Confirmar solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
