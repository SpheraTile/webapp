'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react'
import { Producto, ItemCesta } from '@/types'

// Estado de la cesta
interface CestaState {
  items: ItemCesta[]
}

// Acciones
type CestaAction =
  | { type: 'AGREGAR_ITEM'; producto: Producto; cantidad_m2: number }
  | { type: 'ACTUALIZAR_CANTIDAD'; productoId: string; cantidad_m2: number }
  | { type: 'ELIMINAR_ITEM'; productoId: string }
  | { type: 'VACIAR_CESTA' }

// Estado inicial
const estadoInicial: CestaState = {
  items: [],
}

// Reducer
function cestaReducer(state: CestaState, action: CestaAction): CestaState {
  switch (action.type) {
    case 'AGREGAR_ITEM': {
      const itemExistente = state.items.find(
        (item) => item.producto.id === action.producto.id
      )

      if (itemExistente) {
        // Actualizar cantidad si ya existe
        const nuevaCantidadM2 = itemExistente.cantidad_m2 + action.cantidad_m2
        const nuevaCantidadCajas = Math.ceil(nuevaCantidadM2 / action.producto.m2_caja)
        return {
          ...state,
          items: state.items.map((item) =>
            item.producto.id === action.producto.id
              ? { ...item, cantidad_m2: nuevaCantidadM2, cantidad_cajas: nuevaCantidadCajas }
              : item
          ),
        }
      }

      // Agregar nuevo item
      const cantidad_cajas = Math.ceil(action.cantidad_m2 / action.producto.m2_caja)
      return {
        ...state,
        items: [
          ...state.items,
          { producto: action.producto, cantidad_m2: action.cantidad_m2, cantidad_cajas },
        ],
      }
    }

    case 'ACTUALIZAR_CANTIDAD': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.producto.id === action.productoId
            ? {
                ...item,
                cantidad_m2: action.cantidad_m2,
                cantidad_cajas: Math.ceil(action.cantidad_m2 / item.producto.m2_caja)
              }
            : item
        ),
      }
    }

    case 'ELIMINAR_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.producto.id !== action.productoId
        ),
      }
    }

    case 'VACIAR_CESTA': {
      return {
        ...state,
        items: [],
      }
    }

    default:
      return state
  }
}

// Contexto
interface CestaContextType extends CestaState {
  agregarItem: (producto: Producto, cantidad_m2: number) => void
  actualizarCantidad: (productoId: string, cantidad_m2: number) => void
  eliminarItem: (productoId: string) => void
  vaciarCesta: () => void
  totalM2: number
  totalEuros: number
}

const CestaContext = createContext<CestaContextType | undefined>(undefined)

// Provider
export function CestaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cestaReducer, estadoInicial)

  const agregarItem = useCallback(
    (producto: Producto, cantidad_m2: number) => {
      const minimo = producto.pedido_minimo_m2 || 1

      // Validar contra pedido mínimo
      if (cantidad_m2 < minimo) {
        console.warn(
          `No se puede agregar ${cantidad_m2} m². Pedido mínimo: ${minimo} m²`
        )
        return
      }

      // Validar contra stock disponible
      const itemExistente = state.items.find(
        (item) => item.producto.id === producto.id
      )
      const cantidadActual = itemExistente?.cantidad_m2 || 0
      const cantidadTotal = cantidadActual + cantidad_m2

      if (cantidadTotal > producto.stock_m2) {
        console.warn(
          `No se puede agregar ${cantidad_m2} m². Stock disponible: ${producto.stock_m2 - cantidadActual} m²`
        )
        return
      }

      dispatch({ type: 'AGREGAR_ITEM', producto, cantidad_m2 })
    },
    [state.items]
  )

  const actualizarCantidad = useCallback(
    (productoId: string, cantidad_m2: number) => {
      const item = state.items.find((i) => i.producto.id === productoId)
      if (!item) return

      const minimo = item.producto.pedido_minimo_m2 || 1

      // Validar contra pedido mínimo
      if (cantidad_m2 < minimo) {
        console.warn(
          `Cantidad mínima requerida: ${minimo} m²`
        )
        return
      }

      // Validar contra stock máximo
      if (cantidad_m2 > item.producto.stock_m2) {
        console.warn(
          `Cantidad máxima disponible: ${item.producto.stock_m2} m²`
        )
        return
      }

      dispatch({ type: 'ACTUALIZAR_CANTIDAD', productoId, cantidad_m2 })
    },
    [state.items]
  )

  const eliminarItem = useCallback((productoId: string) => {
    dispatch({ type: 'ELIMINAR_ITEM', productoId })
  }, [])

  const vaciarCesta = useCallback(() => {
    dispatch({ type: 'VACIAR_CESTA' })
  }, [])

  // Calcular totales
  const totalM2 = state.items.reduce(
    (total, item) => total + item.cantidad_m2,
    0
  )

  const totalEuros = state.items.reduce(
    (total, item) => total + item.cantidad_m2 * item.producto.precio_m2,
    0
  )

  return (
    <CestaContext.Provider
      value={{
        items: state.items,
        agregarItem,
        actualizarCantidad,
        eliminarItem,
        vaciarCesta,
        totalM2,
        totalEuros,
      }}
    >
      {children}
    </CestaContext.Provider>
  )
}

// Hook personalizado
export function useCesta() {
  const context = useContext(CestaContext)
  if (context === undefined) {
    throw new Error('useCesta debe usarse dentro de un CestaProvider')
  }
  return context
}
