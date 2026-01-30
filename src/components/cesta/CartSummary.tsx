'use client'

import { useCesta } from '@/context/CestaContext'

interface CartSummaryProps {
  onEnviarPedido: () => void
  enviando?: boolean
}

export function CartSummary({ onEnviarPedido, enviando = false }: CartSummaryProps) {
  const { totalM2, totalEuros, items } = useCesta()

  if (items.length === 0) return null

  return (
    <div className="bg-white border-t border-neutral-200 p-4 space-y-4">
      {/* Resumen */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Total productos</span>
          <span>{items.length} productos</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Total m²</span>
          <span>{totalM2.toFixed(2)} m²</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-neutral-900 pt-2 border-t border-neutral-200">
          <span>Total</span>
          <span>{totalEuros.toFixed(2)}€</span>
        </div>
      </div>

      {/* Botón enviar pedido */}
      <button
        onClick={onEnviarPedido}
        disabled={enviando}
        className="btn-primary w-full"
      >
        {enviando ? 'Enviando pedido...' : 'Enviar pedido al almacén'}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        Los precios no incluyen IVA ni transporte
      </p>
    </div>
  )
}
