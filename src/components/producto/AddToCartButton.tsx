'use client'

import { useState } from 'react'
import { Producto } from '@/types'
import { useCesta } from '@/context/CestaContext'
import { IconPlus, IconMinus, IconCart } from '@/components/ui/Icons'

interface AddToCartButtonProps {
  producto: Producto
  className?: string
}

export function AddToCartButton({ producto, className = '' }: AddToCartButtonProps) {
  const { agregarItem, items } = useCesta()

  // Calcular mínimo en cajas (redondeando hacia arriba)
  // Usar redondeo para evitar errores de precisión de punto flotante
  const minimoM2 = producto.pedido_minimo_m2 || producto.m2_caja
  const minimoCajasExacto = minimoM2 / producto.m2_caja
  const minimoCajas = Math.abs(minimoCajasExacto - Math.round(minimoCajasExacto)) < 0.0001
    ? Math.round(minimoCajasExacto)
    : Math.ceil(minimoCajasExacto)

  // Verificar cantidad ya en cesta
  const itemEnCesta = items.find((i) => i.producto.id === producto.id)
  const cajasEnCesta = itemEnCesta?.cantidad_cajas || 0
  const m2EnCesta = cajasEnCesta * producto.m2_caja

  // Calcular stock disponible en cajas
  const stockDisponibleM2 = producto.stock_m2 - m2EnCesta
  const stockDisponibleCajas = Math.floor(stockDisponibleM2 / producto.m2_caja)

  // Estado: cantidad en CAJAS
  const [cajas, setCajas] = useState(minimoCajas)

  // Calcular m² basado en cajas
  const m2Calculado = cajas * producto.m2_caja

  const handleAgregar = () => {
    if (cajas >= minimoCajas && cajas <= stockDisponibleCajas) {
      agregarItem(producto, cajas)
      setCajas(minimoCajas)
    }
  }

  const incrementar = () => {
    if (cajas < stockDisponibleCajas) {
      setCajas((prev) => prev + 1)
    }
  }

  const decrementar = () => {
    if (cajas > minimoCajas) {
      setCajas((prev) => prev - 1)
    }
  }

  if (stockDisponibleCajas <= 0) {
    return (
      <button
        disabled
        className={`btn-secondary opacity-50 cursor-not-allowed w-full ${className}`}
      >
        Sin stock disponible
      </button>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selector de cantidad en CAJAS */}
      <div className="flex items-center justify-between bg-neutral-100 rounded-lg p-2">
        <button
          onClick={decrementar}
          disabled={cajas <= minimoCajas}
          className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
        >
          <IconMinus size={20} />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={cajas}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val) && val >= minimoCajas && val <= stockDisponibleCajas) {
                setCajas(val)
              }
            }}
            className="w-16 text-center bg-white rounded-lg py-2 font-medium
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            min={minimoCajas}
            max={stockDisponibleCajas}
            step={1}
          />
          <span className="text-neutral-500">cajas</span>
        </div>

        <button
          onClick={incrementar}
          disabled={cajas >= stockDisponibleCajas}
          className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
        >
          <IconPlus size={20} />
        </button>
      </div>

      {/* Info de m² calculados */}
      <div className="text-sm text-center space-y-1">
        <p className="text-neutral-700 font-medium">
          = {m2Calculado.toFixed(2)} m² ({producto.m2_caja} m²/caja)
        </p>
        <p className="text-neutral-500">
          Mínimo: {minimoCajas} {minimoCajas === 1 ? 'caja' : 'cajas'} ({minimoM2.toFixed(2)} m²) · Disponible: {stockDisponibleCajas} cajas ({stockDisponibleM2.toFixed(2)} m²)
        </p>
      </div>

      {/* Botón agregar */}
      <button onClick={handleAgregar} className="btn-primary w-full flex items-center justify-center gap-2">
        <IconCart size={20} />
        <span>Añadir a la cesta</span>
        <span className="text-primary-200">
          ({(m2Calculado * producto.precio_m2).toFixed(2)}€)
        </span>
      </button>
    </div>
  )
}
