# SPHERA TILE - Catálogo de Cerámica B2B

Aplicación web profesional de catálogo de cerámica con sistema de pedidos para clientes B2B (tiendas, obras y distribuidores).

## Stack Tecnológico

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Context API** (gestión de estado)

## Inicio Rápido

```bash
# Eliminar instalación anterior (si existe)
rm -rf node_modules package-lock.json

# Instalar dependencias con Bun
bun install

# Iniciar en desarrollo (con Turbopack)
bun run dev

# Build de producción
bun run build

# Iniciar producción
bun run start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
src/
├── app/                    # Rutas (App Router)
├── components/             # Componentes React
├── context/                # Context API (Cesta)
├── data/                   # Datos mock
└── types/                  # Tipos TypeScript
```

## Documentación

Consulta la carpeta `/docs` para documentación detallada:

- [Arquitectura](./docs/ARQUITECTURA.md)
- [Componentes](./docs/COMPONENTES.md)
- [Modelo de Datos](./docs/DATOS.md)
- [Guía de Despliegue](./docs/DESPLIEGUE.md)

## Funcionalidades

- ✅ Catálogo con +700 productos (mock con 36)
- ✅ Filtros combinables
- ✅ Búsqueda por texto
- ✅ Vista de detalle de producto
- ✅ Cesta de pedidos con validación de stock
- ✅ Envío de pedidos al almacén
- ✅ Diseño mobile-first
- ✅ Navegación inferior optimizada para uso con una mano

## Licencia

Privado - SPHERA TILE © 2024
