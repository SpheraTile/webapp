# Guía de Estilos

## Colores Corporativos

### Paleta Principal (Verde SPHERA TILE)

```css
--primary-50:  #e8f5e9   /* Fondos hover suaves */
--primary-100: #c8e6c9   /* Fondos activos */
--primary-200: #a5d6a7
--primary-300: #81c784
--primary-400: #66bb6a
--primary-500: #2e7d32   /* Verde principal */
--primary-600: #1b5e20   /* Verde oscuro del logo - PRINCIPAL */
--primary-700: #145a1c
--primary-800: #0d4a14
--primary-900: #063d0b
```

### Uso de Colores

| Elemento | Color | Clase Tailwind |
|----------|-------|----------------|
| Botones primarios | primary-600 | `bg-primary-600` |
| Texto activo | primary-600 | `text-primary-600` |
| Hover botones | primary-700 | `hover:bg-primary-700` |
| Fondos suaves | primary-50/100 | `bg-primary-50` |
| Logo texto | primary-600/800 | `text-primary-600` |

### Grises Neutros

```css
--neutral-50:  #fafafa   /* Fondos secundarios */
--neutral-100: #f5f5f5   /* Inputs, cards */
--neutral-200: #eeeeee   /* Bordes */
--neutral-300: #e0e0e0   /* Separadores */
--neutral-400: #bdbdbd   /* Iconos inactivos */
--neutral-500: #9e9e9e   /* Texto secundario */
--neutral-600: #757575   /* Texto auxiliar */
--neutral-700: #616161   /* Texto normal */
--neutral-800: #424242   /* Texto destacado */
--neutral-900: #212121   /* Texto principal */
```

---

## Tipografía

### Fuente

```css
font-family: 'Inter', system-ui, sans-serif;
```

### Tamaños

| Uso | Clase | Tamaño |
|-----|-------|--------|
| Títulos página | `text-2xl` | 24px |
| Títulos sección | `text-xl` | 20px |
| Subtítulos | `text-lg` | 18px |
| Texto normal | `text-base` | 16px |
| Texto pequeño | `text-sm` | 14px |
| Labels | `text-xs` | 12px |

### Pesos

```css
font-normal: 400   /* Texto general */
font-medium: 500   /* Énfasis suave */
font-semibold: 600 /* Botones, precios */
font-bold: 700     /* Títulos principales */
```

---

## Espaciado

### Sistema de 4px

```css
0.5: 2px
1:   4px
2:   8px
3:   12px
4:   16px   /* Padding estándar */
5:   20px
6:   24px   /* Margen entre secciones */
8:   32px
10:  40px
12:  48px
16:  64px
```

### Uso Común

```html
<!-- Padding de página -->
<div class="p-4">

<!-- Espaciado entre elementos -->
<div class="space-y-4">

<!-- Margen entre secciones -->
<section class="my-6">
```

---

## Componentes Predefinidos

### Botones

```css
/* Primario */
.btn-primary {
  @apply bg-primary-600 text-white font-medium px-6 py-3 rounded-lg
         transition-colors duration-200 hover:bg-primary-700
         active:bg-primary-800 disabled:opacity-50;
}

/* Secundario */
.btn-secondary {
  @apply bg-white text-neutral-900 font-medium px-6 py-3 rounded-lg
         border border-neutral-300 transition-colors
         hover:bg-neutral-50 active:bg-neutral-100;
}

/* Outline */
.btn-outline {
  @apply bg-transparent text-primary-600 font-medium px-6 py-3 rounded-lg
         border border-primary-600 transition-colors
         hover:bg-primary-50 active:bg-primary-100;
}
```

### Inputs

```css
.input-base {
  @apply w-full px-4 py-3 bg-neutral-100 rounded-full
         border border-transparent text-neutral-900
         placeholder:text-neutral-500
         focus:outline-none focus:border-primary-500 focus:bg-white
         transition-all duration-200;
}
```

### Cards

```css
.product-card {
  @apply bg-white rounded-lg overflow-hidden
         transition-transform duration-200 active:scale-[0.98];
}
```

### Badges

```css
.stock-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5
         bg-neutral-100 rounded-full text-sm text-neutral-700;
}
```

---

## Responsive Design

### Breakpoints

```css
sm:  640px   /* Móviles grandes */
md:  768px   /* Tablets */
lg:  1024px  /* Desktop */
xl:  1280px  /* Desktop grande */
2xl: 1536px  /* Pantallas anchas */
```

### Mobile First

```html
<!-- 2 columnas mobile, 3 tablet, 4 desktop -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

### Navegación

- **Mobile**: Barra inferior fija
- **Desktop**: Sidebar o header

```html
<!-- Solo visible en mobile -->
<nav class="lg:hidden">

<!-- Solo visible en desktop -->
<aside class="hidden lg:block">
```

---

## Animaciones

### Transiciones Estándar

```css
transition-colors duration-200  /* Colores */
transition-transform duration-200  /* Escalas */
transition-all duration-300  /* Todo */
```

### Hover States

```html
<!-- Escala suave al presionar -->
<div class="active:scale-[0.98]">

<!-- Cambio de color -->
<button class="hover:bg-neutral-50">
```

---

## Iconografía

### Tamaños Estándar

| Contexto | Tamaño |
|----------|--------|
| Navegación | 24px |
| Botones | 20px |
| Badges | 16px |
| Inline | 14px |

### Estilo

- Stroke-based (no relleno)
- Stroke width: 2px
- Line cap: round
- Line join: round

---

## Safe Areas (Mobile)

```css
/* Padding inferior para notch/gestures */
.pb-safe {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* En body */
body {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## Accesibilidad

### Contraste

- Texto sobre fondo: mínimo 4.5:1
- Elementos interactivos: mínimo 3:1

### Focus States

```css
focus:outline-none focus:ring-2 focus:ring-primary-500
```

### Touch Targets

Mínimo 44x44px para elementos táctiles:

```html
<button class="p-3"> <!-- 48px total -->
```
