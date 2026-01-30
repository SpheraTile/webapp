# Guía de Componentes

## Componentes UI Base

### Icons

Colección de iconos SVG optimizados.

```tsx
import { IconHome, IconSearch, IconCart } from '@/components/ui/Icons'

<IconHome size={24} className="text-primary-600" />
```

**Props disponibles:**
- `size?: number` (default: 24)
- `className?: string`

**Iconos disponibles:**
- `IconHome` - Inicio
- `IconSearch` - Búsqueda
- `IconGrid` - Vista grid
- `IconList` - Vista lista
- `IconFilter` - Filtros
- `IconCart` - Cesta
- `IconUser` - Usuario
- `IconQR` - Código QR
- `IconChevronDown/Up/Left` - Flechas
- `IconPlus/Minus` - Más/Menos
- `IconTrash` - Eliminar
- `IconX` - Cerrar
- `IconCheck` - Confirmación
- `IconStock` - Stock
- `IconCeramoteca` - Ceramoteca

---

### StockBadge

Muestra la disponibilidad de stock con estados visuales.

```tsx
import { StockBadge } from '@/components/ui/StockBadge'

<StockBadge stock_m2={673.92} />
```

**Props:**
- `stock_m2: number` - Metros cuadrados disponibles
- `className?: string`

**Estados visuales:**
- Stock > 50 m² → Gris neutro
- Stock 1-50 m² → Ámbar (stock bajo)
- Stock = 0 → Rojo (sin stock)

---

### PriceTag

Muestra el precio formateado por metro cuadrado.

```tsx
import { PriceTag } from '@/components/ui/PriceTag'

<PriceTag precio_m2={9.75} size="lg" />
```

**Props:**
- `precio_m2: number` - Precio por m²
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `className?: string`

---

### SearchBar

Barra de búsqueda con soporte para QR.

```tsx
import { SearchBar } from '@/components/ui/SearchBar'

<SearchBar
  value={busqueda}
  onChange={setBusqueda}
  placeholder="¿Qué estás buscando?"
  showQR
  onQRClick={handleQR}
/>
```

**Props:**
- `value?: string`
- `onChange?: (value: string) => void`
- `placeholder?: string`
- `showQR?: boolean`
- `onQRClick?: () => void`
- `className?: string`

---

### ProductImage

Imagen de producto con fallback automático.

```tsx
import { ProductImage } from '@/components/ui/ProductImage'

<ProductImage
  src="/productos/andromeda-bone.jpg"
  alt="ANDROMEDA BONE R9"
  fill
  sizes="100vw"
/>
```

**Props:**
- `src: string`
- `alt: string`
- `fill?: boolean`
- `className?: string`
- `sizes?: string`
- `priority?: boolean`

Si la imagen falla, muestra un placeholder con el nombre del producto.

---

## Componentes de Producto

### ProductCard

Tarjeta de producto para el grid del catálogo.

```tsx
import { ProductCard } from '@/components/producto/ProductCard'

<ProductCard producto={producto} />
```

**Props:**
- `producto: Producto`
- `className?: string`

**Incluye:**
- Imagen con aspect-ratio 1:1
- Nombre en mayúsculas
- Formato
- Badge de stock
- Precio por m²

---

### ProductGrid

Grid responsive de productos.

```tsx
import { ProductGrid } from '@/components/producto/ProductGrid'

<ProductGrid productos={productosFiltrados} />
```

**Props:**
- `productos: Producto[]`
- `className?: string`

**Responsive:**
- Mobile: 2 columnas
- Tablet: 3 columnas
- Desktop: 4 columnas

Muestra mensaje vacío si no hay productos.

---

### AddToCartButton

Selector de cantidad y botón de añadir a cesta.

```tsx
import { AddToCartButton } from '@/components/producto/AddToCartButton'

<AddToCartButton producto={producto} />
```

**Props:**
- `producto: Producto`
- `className?: string`

**Funcionalidad:**
- Selector de cantidad con +/-
- Input numérico editable
- Validación contra stock disponible
- Muestra precio total calculado
- Deshabilitado si no hay stock

---

## Componentes de Filtros

### FiltersDrawer

Panel de filtros (drawer en móvil, sidebar en desktop).

```tsx
import { FiltersDrawer } from '@/components/filtros/FiltersDrawer'

<FiltersDrawer
  isOpen={mostrarFiltros}
  onClose={() => setMostrarFiltros(false)}
  filtros={filtrosActivos}
  onFiltrosChange={setFiltrosActivos}
/>
```

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `filtros: FiltrosActivos`
- `onFiltrosChange: (filtros: FiltrosActivos) => void`

---

### FilterSection

Sección colapsable de filtros.

```tsx
import { FilterSection } from '@/components/filtros/FilterSection'

<FilterSection titulo="Calidad" defaultOpen>
  {/* CheckboxFilter items */}
</FilterSection>
```

---

### FilterCheckbox

Checkbox individual de filtro.

```tsx
import { FilterCheckbox } from '@/components/filtros/FilterCheckbox'

<FilterCheckbox
  label="Porcelánico"
  checked={filtros.includes('Porcelánico')}
  onChange={(checked) => handleToggle('Porcelánico')}
/>
```

---

## Componentes de Cesta

### CartItem

Item individual en la cesta.

```tsx
import { CartItem } from '@/components/cesta/CartItem'

<CartItem item={itemCesta} />
```

**Props:**
- `item: ItemCesta`

**Funcionalidad:**
- Imagen y datos del producto
- Controles de cantidad
- Botón eliminar
- Subtotal calculado

---

### CartSummary

Resumen de la cesta con totales.

```tsx
import { CartSummary } from '@/components/cesta/CartSummary'

<CartSummary
  onEnviarPedido={handleEnviar}
  enviando={isLoading}
/>
```

**Props:**
- `onEnviarPedido: () => void`
- `enviando?: boolean`

---

## Componentes de Layout

### Header

Cabecera de la aplicación.

```tsx
import { Header } from '@/components/layout/Header'

<Header
  titulo="Productos"
  showBack
  showSearch
  onSearchClick={toggleSearch}
/>
```

**Props:**
- `titulo?: string`
- `showBack?: boolean`
- `showSearch?: boolean`
- `onSearchClick?: () => void`
- `className?: string`

---

### BottomNavigation

Navegación inferior para móvil.

```tsx
import { BottomNavigation } from '@/components/layout/BottomNavigation'

<BottomNavigation />
```

**Elementos:**
- Inicio (`/`)
- Productos (`/productos`)
- Ceramoteca (`/ceramoteca`)
- Cesta (`/cesta`) - con badge de cantidad
- Mi Cuenta (`/cuenta`)

Detecta la ruta activa automáticamente.
