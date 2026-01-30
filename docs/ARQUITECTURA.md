# Arquitectura del Proyecto

## Visión General

SPHERA TILE sigue una arquitectura modular basada en Next.js 14 App Router, con separación clara entre Server Components y Client Components.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Páginas   │  │ Componentes │  │   Context (Cesta)   │  │
│  │  (App Dir)  │  │     UI      │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │   Datos   │                             │
│                    │   Mock    │                             │
│                    └─────┬─────┘                             │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                          ▼                                   │
│              [ API / Backend Futuro ]                        │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raíz (Server Component)
│   ├── page.tsx                  # Home
│   ├── globals.css               # Estilos globales
│   ├── not-found.tsx             # Página 404
│   ├── productos/
│   │   ├── page.tsx              # Listado de productos
│   │   └── [slug]/
│   │       └── page.tsx          # Detalle de producto
│   ├── cesta/
│   │   └── page.tsx              # Carrito de compras
│   ├── cuenta/
│   │   └── page.tsx              # Mi cuenta
│   └── ceramoteca/
│       └── page.tsx              # Escáner QR (placeholder)
│
├── components/
│   ├── ui/                       # Componentes UI base
│   │   ├── Icons.tsx             # Iconos SVG
│   │   ├── StockBadge.tsx        # Badge de disponibilidad
│   │   ├── PriceTag.tsx          # Etiqueta de precio
│   │   ├── SearchBar.tsx         # Barra de búsqueda
│   │   └── ProductImage.tsx      # Imagen con fallback
│   │
│   ├── producto/                 # Componentes de producto
│   │   ├── ProductCard.tsx       # Tarjeta de producto
│   │   ├── ProductGrid.tsx       # Grid de productos
│   │   └── AddToCartButton.tsx   # Botón añadir a cesta
│   │
│   ├── filtros/                  # Sistema de filtros
│   │   ├── FiltersDrawer.tsx     # Panel lateral de filtros
│   │   ├── FilterSection.tsx     # Sección colapsable
│   │   └── FilterCheckbox.tsx    # Checkbox de filtro
│   │
│   ├── cesta/                    # Componentes de cesta
│   │   ├── CartItem.tsx          # Item en la cesta
│   │   └── CartSummary.tsx       # Resumen y totales
│   │
│   └── layout/                   # Componentes de layout
│       ├── Header.tsx            # Cabecera
│       └── BottomNavigation.tsx  # Navegación inferior móvil
│
├── context/
│   └── CestaContext.tsx          # Estado global de la cesta
│
├── data/
│   └── productos.ts              # Datos mock + funciones de filtrado
│
└── types/
    └── index.ts                  # Tipos TypeScript
```

## Patrones de Diseño

### 1. Server Components vs Client Components

| Tipo | Uso | Ejemplos |
|------|-----|----------|
| Server | Páginas, datos estáticos | `page.tsx`, `layout.tsx` |
| Client | Interactividad, estado | Filtros, Cesta, Búsqueda |

### 2. Composición de Componentes

```tsx
// Componentes pequeños y reutilizables
<ProductCard>
  <ProductImage />
  <StockBadge />
  <PriceTag />
</ProductCard>
```

### 3. Context para Estado Global

```tsx
// Solo para estado que necesita ser compartido
<CestaProvider>
  <App />
</CestaProvider>
```

## Flujo de Datos

```
Usuario → Acción → Context/State → Re-render → UI actualizada
                        ↓
              (Futuro: API call)
```

## Decisiones Técnicas

### ¿Por qué Next.js App Router?

- Server Components por defecto (mejor rendimiento)
- Layouts anidados
- Streaming y Suspense integrado
- Mejor SEO

### ¿Por qué Context API en lugar de Redux/Zustand?

- Complejidad adecuada para el caso de uso
- Sin dependencias adicionales
- Fácil de migrar a otra solución si es necesario

### ¿Por qué Tailwind CSS?

- Desarrollo rápido
- Bundle optimizado (solo CSS usado)
- Consistencia con tokens de diseño
- Mobile-first por defecto

## Preparación para Producción

### Integración con Backend

Los datos mock están preparados para ser reemplazados por llamadas a API:

```typescript
// Actual (mock)
import { productos } from '@/data/productos'

// Futuro (API)
const productos = await fetch('/api/productos').then(r => r.json())
```

### Puntos de Integración

1. **Autenticación**: Añadir provider en `layout.tsx`
2. **API de productos**: Reemplazar `data/productos.ts`
3. **API de pedidos**: Conectar `CartSummary.tsx`
4. **API de usuarios**: Conectar `cuenta/page.tsx`
