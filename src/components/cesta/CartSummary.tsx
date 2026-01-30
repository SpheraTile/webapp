'use client'

import { useTranslations } from 'next-intl'
import { useCesta } from '@/context/CestaContext'

interface CartSummaryProps {
  onEnviarPedido: () => void
  enviando?: boolean
}

export function CartSummary({ onEnviarPedido, enviando = false }: CartSummaryProps) {
  const { totalM2, totalEuros, items } = useCesta()
  const t = useTranslations('cart')

  if (items.length === 0) return null

  return (
    <div className="bg-white border-t border-neutral-200 p-4 space-y-4">
      {/* Resumen */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>{t('totalProducts')}</span>
          <span>{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>{t('totalM2')}</span>
          <span>{totalM2.toFixed(2)} m²</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-neutral-900 pt-2 border-t border-neutral-200">
          <span>{t('total')}</span>
          <span>{totalEuros.toFixed(2)}€</span>
        </div>
      </div>

      {/* Botón enviar pedido */}
      <button
        onClick={onEnviarPedido}
        disabled={enviando}
        className="btn-primary w-full"
      >
        {enviando ? t('sendingOrder') : t('sendOrder')}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        {t('pricesNote')}
      </p>
    </div>
  )
}
