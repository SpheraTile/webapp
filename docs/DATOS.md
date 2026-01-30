# Modelo de Datos

## Tipos TypeScript

### Producto

```typescript
interface Producto {
  id: string              // Identificador único
  slug: string            // URL-friendly (ej: "andromeda-bone-r9")
  nombre: string          // Nombre mostrado (ej: "ANDROMEDA BONE R9")
  imagen: string          // Ruta de la imagen
  formato: string         // Dimensiones (ej: "120x120")
  precio_m2: number       // Precio por metro cuadrado
  stock_m2: number        // Stock disponible en m²
  calidad: Calidad        // "COM" | "PRIMERA"
  materia_prima: MateriaPrima  // "Porcelánico" | "Gres" | "Azulejo"
  aspecto: Aspecto        // "Blanco" | "Cemento" | "Madera" | etc.
  acabado: Acabado        // "Mate" | "Pulido" | "Satinado" | "Texturizado"
  descripcion?: string    // Descripción opcional
  imagenes_adicionales?: string[]  // Galería adicional
}
```

### Enumeraciones

```typescript
type Calidad = 'COM' | 'PRIMERA'

type MateriaPrima = 'Porcelánico' | 'Gres' | 'Azulejo'

type Aspecto =
  | 'Blanco'
  | 'Cemento'
  | 'Colores'
  | 'Madera'
  | 'Mármol'
  | 'Piedra'
  | 'Terracota'

type Acabado = 'Mate' | 'Pulido' | 'Satinado' | 'Texturizado'
```

### Cesta

```typescript
interface ItemCesta {
  producto: Producto
  cantidad_m2: number
}

interface Cesta {
  items: ItemCesta[]
  total_m2: number
  total_euros: number
}
```

### Pedido

```typescript
interface DatosPedido {
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  empresa?: string
  direccion_envio: string
  ciudad: string
  codigo_postal: string
  notas?: string
}

interface Pedido extends DatosPedido {
  id: string
  fecha: Date
  items: ItemCesta[]
  total_m2: number
  total_euros: number
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado'
}
```

---

## Datos Mock

### Productos Incluidos (36)

| Serie | Productos | Aspecto | Formato |
|-------|-----------|---------|---------|
| ANDROMEDA | 3 | Mármol | 120x120 |
| AURA | 3 | Cemento | 120x120 |
| FOREST | 4 | Madera | 20x120 |
| PETRA | 3 | Piedra | 60x120 |
| CARRARA | 3 | Mármol | 60x120 |
| PURO | 3 | Blanco | 30x60 |
| URBAN | 3 | Cemento | 60x60 |
| CALACATTA | 2 | Mármol | 120x120 |
| COLORS | 4 | Colores | 20x20 |
| BASIC | 3 | Varios | 45x45 |
| TERRA | 2 | Terracota | 30x30 |
| SLATE | 3 | Piedra | 30x60 |

### Rango de Precios

- **Económico (COM)**: 5.90€/m²
- **Estándar**: 7.50€ - 14.50€/m²
- **Premium**: 15.90€ - 19.90€/m²
- **Luxury**: 24.90€ - 26.50€/m²

---

## Funciones de Utilidad

### filtrarProductos

```typescript
function filtrarProductos(
  productos: Producto[],
  filtros: {
    busqueda?: string
    calidad?: string[]
    materia_prima?: string[]
    aspecto?: string[]
    acabado?: string[]
    solo_con_stock?: boolean
  }
): Producto[]
```

**Ejemplo:**
```typescript
const resultados = filtrarProductos(productos, {
  busqueda: 'mármol',
  calidad: ['PRIMERA'],
  acabado: ['Pulido'],
})
```

### obtenerProductoPorSlug

```typescript
function obtenerProductoPorSlug(slug: string): Producto | undefined
```

### obtenerProductoPorId

```typescript
function obtenerProductoPorId(id: string): Producto | undefined
```

---

## Integración con API (Futuro)

### Endpoints Sugeridos

```
GET  /api/productos              # Listado con filtros
GET  /api/productos/:slug        # Detalle de producto
GET  /api/productos/:id/stock    # Stock en tiempo real

POST /api/cesta                  # Crear/actualizar cesta
GET  /api/cesta                  # Obtener cesta actual

POST /api/pedidos                # Crear pedido
GET  /api/pedidos                # Historial de pedidos
GET  /api/pedidos/:id            # Detalle de pedido

GET  /api/usuario                # Datos del usuario
PUT  /api/usuario                # Actualizar datos
```

### Ejemplo de Migración

```typescript
// Antes (mock)
import { productos, filtrarProductos } from '@/data/productos'

const resultados = filtrarProductos(productos, filtros)

// Después (API)
async function obtenerProductos(filtros: FiltrosProducto) {
  const params = new URLSearchParams(filtros as any)
  const res = await fetch(`/api/productos?${params}`)
  return res.json()
}

const resultados = await obtenerProductos(filtros)
```

---

## Validaciones

### Stock

- No permitir añadir más cantidad que el stock disponible
- Mostrar advertencia visual cuando stock < 50 m²
- Bloquear producto cuando stock = 0

### Cantidades

- Mínimo: 1 m²
- Máximo: stock disponible
- Permitir decimales (0.01 m²)

### Pedido

- Al menos 1 item en la cesta
- Todos los items deben tener stock suficiente
- Datos de cliente completos antes de enviar
