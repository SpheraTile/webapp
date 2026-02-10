# SPHERA TILE - Catálogo de Cerámica B2B

Aplicación web profesional de catálogo de cerámica con sistema de pedidos para clientes B2B (tiendas, obras y distribuidores).

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16 (App Router), React, TypeScript |
| **Estilos** | Tailwind CSS |
| **ORM** | Prisma |
| **Base de datos** | PostgreSQL (Neon) + pgvector |
| **Autenticación** | NextAuth.js (JWT + Credentials) |
| **i18n** | next-intl (es, en, ar) |
| **PDF** | html2canvas + jsPDF |
| **IA** | OpenAI (chat) + Gemini (embeddings) |
| **CDN** | Bunny CDN |
| **Email** | Resend |
| **Password hashing** | bcryptjs |

## Inicio Rápido

```bash
# Instalar dependencias
bun install

# Configurar variables de entorno (.env.local)
cp .env.example .env.local

# Generar cliente Prisma
bun run prisma generate

# Ejecutar migraciones
bun run prisma migrate dev

# Iniciar en desarrollo (con Turbopack)
bun run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Comandos

```bash
bun run dev          # Desarrollo (Turbopack)
bun run build        # Build de producción
bun run start        # Producción
bun run lint         # Linting
bun run prisma:studio # GUI de base de datos
```

## Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# OpenAI (Chatbot)
OPENAI_API_KEY="sk-..."

# Gemini (Embeddings)
GEMINI_API_KEY="..."

# Bunny CDN
BUNNY_API_KEY="..."
BUNNY_STORAGE_ZONE="..."

# Resend (Email)
RESEND_API_KEY="re_..."
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/              # Rutas de autenticación
│   ├── almacen/             # Panel de administración
│   ├── cuenta/              # Zona de cliente
│   ├── api/                 # API Routes
│   ├── productos/           # Catálogo público
│   ├── cesta/               # Carrito de compra
│   ├── ceramoteca/          # Biblioteca de referencia
│   └── layout.tsx           # Layout raíz
├── components/
│   ├── admin/               # Componentes admin
│   ├── cesta/               # Componentes carrito
│   ├── chat/                # Chatbot IA
│   ├── filtros/             # Filtros de productos
│   ├── layout/              # Header, Nav, Footer
│   ├── producto/            # Tarjetas, grid de productos
│   └── ui/                  # Componentes genéricos
├── context/
│   ├── CestaContext.tsx     # Estado del carrito
│   └── ChatContext.tsx      # Estado del chatbot
├── lib/
│   ├── auth.ts              # Configuración NextAuth
│   ├── pdf.ts               # Generación de PDFs
│   ├── email.ts             # Envío de emails
│   ├── embeddings.ts        # Embeddings IA
│   └── prisma.ts            # Cliente Prisma
└── types/                   # Tipos TypeScript
```

## Rutas de la Aplicación

### Pública
| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/productos` | Catálogo de productos |
| `/productos/[slug]` | Detalle de producto |
| `/ceramoteca` | Biblioteca de referencia |
| `/cesta` | Carrito de compra |
| `/login` | Inicio de sesión |
| `/forgot-password` | Recuperar contraseña |

### Zona Cliente (`/cuenta/`)
| Ruta | Descripción |
|------|-------------|
| `/cuenta` | Dashboard |
| `/cuenta/perfil` | Editar perfil |
| `/cuenta/pedidos` | Mis pedidos |
| `/cuenta/pedidos/[id]` | Detalle de pedido |
| `/cuenta/facturas` | Mis facturas |
| `/cuenta/facturas/[id]` | Detalle de factura |
| `/cuenta/facturacion` | Datos de facturación |
| `/cuenta/direcciones` | Libreta de direcciones |
| `/cuenta/notificaciones` | Preferencias |
| `/cuenta/ayuda` | Ayuda |

### Panel Admin (`/almacen/`)
| Ruta | Descripción |
|------|-------------|
| `/almacen` | Dashboard |
| `/almacen/pedidos` | Gestión de pedidos |
| `/almacen/pedidos/[id]` | Detalle de pedido |
| `/almacen/pedidos/nuevo` | Crear pedido manual |
| `/almacen/productos` | Catálogo de productos |
| `/almacen/productos/nuevo` | Crear producto |
| `/almacen/productos/[id]/editar` | Editar producto |
| `/almacen/albaranes` | Notas de entrega |
| `/almacen/albaranes/[id]` | Detalle de albarán |
| `/almacen/facturas` | Facturas |
| `/almacen/facturas/[id]` | Detalle de factura |
| `/almacen/usuarios` | Gestión de usuarios |
| `/almacen/catalogo` | Generador de catálogo PDF |
| `/almacen/portada` | Gestión de portadas |

## API Routes

### Autenticación
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Resetear contraseña
- `POST /api/auth/change-password` - Cambiar contraseña

### Pedidos
- `GET /api/pedidos` - Listar (admin)
- `POST /api/pedidos` - Crear manual (admin)
- `GET /api/pedidos/[id]` - Detalle
- `PUT /api/pedidos/[id]` - Actualizar (admin)
- `POST /api/mis-pedidos` - Crear desde cesta
- `GET /api/mis-pedidos` - Listar (cliente)

### Productos
- `GET /api/productos` - Listar (público)
- `POST /api/productos` - Crear (admin)
- `GET /api/productos/[id]` - Detalle
- `PUT /api/productos/[id]` - Actualizar (admin)
- `DELETE /api/productos/[id]` - Eliminar (admin)

### Facturas
- `GET /api/facturas` - Listar (admin)
- `POST /api/facturas` - Crear (admin)
- `GET /api/facturas/[id]` - Detalle (admin)
- `PUT /api/facturas/[id]` - Actualizar (admin)
- `GET /api/mis-facturas` - Listar (cliente)
- `GET /api/mis-facturas/[id]` - Detalle (cliente)

### Albaranes
- `GET /api/albaranes` - Listar (admin)
- `POST /api/albaranes` - Crear (admin)
- `GET /api/albaranes/[id]` - Detalle
- `PUT /api/albaranes/[id]` - Actualizar (admin)

### Usuarios
- `GET /api/usuarios` - Listar (admin)
- `POST /api/usuarios` - Crear (admin)
- `GET /api/usuarios/[id]` - Detalle (admin)
- `PUT /api/usuarios/[id]` - Actualizar (admin)
- `DELETE /api/usuarios/[id]` - Eliminar (admin)
- `GET /api/perfil` - Mi perfil
- `PUT /api/perfil` - Actualizar mi perfil

### IA & Utilidades
- `POST /api/chat` - Chatbot OpenAI (rate limit 20/min)
- `POST /api/embeddings` - Generar embeddings
- `POST /api/upload` - Subir archivo (Bunny CDN)
- `GET /api/estadisticas` - Estadísticas (admin)
- `POST /api/gdpr/solicitar-borrado` - GDPR

## Modelo de Datos

### Usuario (User)
- email, password, nombre, role (ADMIN|CLIENTE)
- teléfono, empresa, NIF/CIF, dirección
- idioma (es|en|ar), activo

### Producto
- referencia, slug, nombre, serie
- formato, calidad, materia_prima, acabado
- precio_m2, stock_m2
- m2_caja, piezas_caja, cajas_palet, peso_caja_kg
- hs_code, estado_producto (NORMAL|OFERTA|NOVEDAD)

### Pedido
- numero_pedido, userId, estado (PENDIENTE|CONFIRMADO|PREPARANDO|ENVIADO|ENTREGADO|CANCELADO)
- dirección de envío, totales, IVA

### Albaran
- numero_albaran, pedidoId, estado (BORRADOR|EMITIDO|ENTREGADO|ANULADO)
- peso_total, transportista, matrícula

### Factura
- numero_factura, pedidoId, estado (BORRADOR|EMITIDA|PAGADA|VENCIDA|ANULADA)
- método de pago, vencimiento, fecha pago

## Funcionalidades

### Cliente
- ✅ Catálogo de productos con filtros
- ✅ Búsqueda por texto
- ✅ Vista detalle de producto
- ✅ Cesta de pedidos con validación de stock
- ✅ Envío de pedidos
- ✅ Seguimiento de pedidos
- ✅ Descarga de facturas (PDF)
- ✅ Gestión de perfil y direcciones
- ✅ Chatbot IA integrado

### Administración
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de pedidos
- ✅ Creación manual de pedidos
- ✅ Gestión de catálogo (CRUD)
- ✅ Edición inline de stock
- ✅ Gestión de albaranes (PDF con firmas)
- ✅ Gestión de facturas (PDF)
- ✅ Gestión de usuarios
- ✅ Generador de catálogo PDF (2x2, portada)
- ✅ Exportación de documentos (email, WhatsApp)

### Técnicas
- ✅ Autenticación JWT con NextAuth
- ✅ Autorización por roles (ADMIN|CLIENTE)
- ✅ Multi-idioma (es, en, ar)
- ✅ Generación de PDFs profesionales
- ✅ Subida de imágenes a CDN
- ✅ Chatbot IA con contexto de productos
- ✅ Búsqueda vectorial (pgvector)
- ✅ Responsive (mobile-first)

## Información de la Empresa

**SPHERA TILE S.L.**
- NIF: ESB12945796
- Dirección: AVDA. DEL MEDITERRÁNEO, 113 - 12200 ONDA, CASTELLÓN
- IBAN: ES33 3058 7304 6527 2040 4063 (CAJAMAR)

## Licencia

Privado - SPHERA TILE © 2024-2025
