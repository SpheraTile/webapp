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

// Acciones - ahora trabajamos con CAJAS
type CestaAction =
  | { type: 'AGREGAR_ITEM'; producto: Producto; cantidad_cajas: number }
  | { type: 'ACTUALIZAR_CANTIDAD'; productoId: string; cantidad_cajas: number }
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
        const nuevaCantidadCajas = itemExistente.cantidad_cajas + action.cantidad_cajas
        const nuevaCantidadM2 = nuevaCantidadCajas * action.producto.m2_caja
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
      const cantidad_m2 = action.cantidad_cajas * action.producto.m2_caja
      return {
        ...state,
        items: [
          ...state.items,
          { producto: action.producto, cantidad_m2, cantidad_cajas: action.cantidad_cajas },
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
                cantidad_cajas: action.cantidad_cajas,
                cantidad_m2: action.cantidad_cajas * item.producto.m2_caja
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
  agregarItem: (producto: Producto, cantidad_cajas: number) => void
  actualizarCantidad: (productoId: string, cantidad_cajas: number) => void
  eliminarItem: (productoId: string) => void
  vaciarCesta: () => void
  totalM2: number
  totalCajas: number
  totalEuros: number
}

const CestaContext = createContext<CestaContextType | undefined>(undefined)

// Provider
export function CestaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cestaReducer, estadoInicial)

  const agregarItem = useCallback(
    (producto: Producto, cantidad_cajas: number) => {
      // Calcular mínimo en cajas
      const minimoM2 = producto.pedido_minimo_m2 || producto.m2_caja
      const minimoCajas = Math.ceil(minimoM2 / producto.m2_caja)

      // Validar contra pedido mínimo
      if (cantidad_cajas < minimoCajas) {
        console.warn(
          `No se puede agregar ${cantidad_cajas} cajas. Mínimo: ${minimoCajas} cajas`
        )
        return
      }

      // Validar contra stock disponible
      const itemExistente = state.items.find(
        (item) => item.producto.id === producto.id
      )
      const cajasActuales = itemExistente?.cantidad_cajas || 0
      const cajasTotal = cajasActuales + cantidad_cajas
      const m2Total = cajasTotal * producto.m2_caja

      if (m2Total > producto.stock_m2) {
        const cajasDisponibles = Math.floor((producto.stock_m2 - cajasActuales * producto.m2_caja) / producto.m2_caja)
        console.warn(
          `No se puede agregar ${cantidad_cajas} cajas. Disponibles: ${cajasDisponibles} cajas`
        )
        return
      }

      dispatch({ type: 'AGREGAR_ITEM', producto, cantidad_cajas })
    },
    [state.items]
  )

  const actualizarCantidad = useCallback(
    (productoId: string, cantidad_cajas: number) => {
      const item = state.items.find((i) => i.producto.id === productoId)
      if (!item) return

      // Calcular mínimo en cajas
      const minimoM2 = item.producto.pedido_minimo_m2 || item.producto.m2_caja
      const minimoCajas = Math.ceil(minimoM2 / item.producto.m2_caja)

      // Validar contra pedido mínimo
      if (cantidad_cajas < minimoCajas) {
        console.warn(
          `Cantidad mínima requerida: ${minimoCajas} cajas`
        )
        return
      }

      // Validar contra stock máximo
      const m2Solicitados = cantidad_cajas * item.producto.m2_caja
      if (m2Solicitados > item.producto.stock_m2) {
        const maxCajas = Math.floor(item.producto.stock_m2 / item.producto.m2_caja)
        console.warn(
          `Cantidad máxima disponible: ${maxCajas} cajas`
        )
        return
      }

      dispatch({ type: 'ACTUALIZAR_CANTIDAD', productoId, cantidad_cajas })
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

  const totalCajas = state.items.reduce(
    (total, item) => total + item.cantidad_cajas,
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
        totalCajas,
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
