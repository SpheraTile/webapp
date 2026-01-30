# Guía de Despliegue

## Requisitos

- **Bun 1.0+** (recomendado) o Node.js 18.17+

### Instalar Bun

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# macOS / Linux
curl -fsSL https://bun.sh/install | bash
```

---

## Desarrollo Local con Bun

```bash
# Clonar repositorio
git clone <repo-url>
cd spheratiles

# Eliminar node_modules y locks anteriores (si existen)
rm -rf node_modules package-lock.json

# Instalar dependencias con Bun
bun install

# Iniciar servidor de desarrollo (con Turbopack)
bun run dev
```

Acceder a `http://localhost:3000`

---

## Build de Producción

```bash
# Crear build optimizado
bun run build

# Iniciar servidor de producción
bun run start
```

---

## Comandos Bun vs npm

| Acción | Bun | npm |
|--------|-----|-----|
| Instalar deps | `bun install` | `npm install` |
| Añadir paquete | `bun add <pkg>` | `npm install <pkg>` |
| Dev server | `bun run dev` | `npm run dev` |
| Build | `bun run build` | `npm run build` |
| Start | `bun run start` | `npm start` |

---

## Despliegue en Vercel (Recomendado)

### Opción 1: CLI

```bash
# Instalar Vercel CLI
bun add -g vercel

# Desplegar
vercel
```

### Opción 2: GitHub Integration

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar:
   - Framework: Next.js
   - Build Command: `bun run build`
   - Install Command: `bun install`
   - Output Directory: `.next`
3. Deploy automático en cada push

---

## Despliegue en Docker

### Dockerfile con Bun

```dockerfile
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["bun", "server.js"]
```

### Comandos Docker

```bash
# Construir imagen
docker build -t spheratiles .

# Ejecutar contenedor
docker run -p 3000:3000 spheratiles
```

---

## Variables de Entorno

### Desarrollo (.env.local)

```env
# URL base de la API (futuro)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Configuración de imágenes
NEXT_PUBLIC_IMAGE_DOMAIN=cdn.spheratile.com
```

### Producción

```env
NEXT_PUBLIC_API_URL=https://api.spheratile.com
NEXT_PUBLIC_IMAGE_DOMAIN=cdn.spheratile.com
```

---

## Configuración de Imágenes

### next.config.js

Para cargar imágenes de dominios externos:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.spheratile.com',
      },
      {
        protocol: 'https',
        hostname: 'images.spheratile.com',
      },
    ],
  },
}
```

---

## Optimización de Producción

### 1. Análisis del Bundle

```bash
# Instalar analizador
bun add @next/bundle-analyzer

# Ejecutar análisis (PowerShell)
$env:ANALYZE="true"; bun run build

# Ejecutar análisis (bash)
ANALYZE=true bun run build
```

### 2. Caché de Imágenes

Configurar CDN con headers de caché:

```
Cache-Control: public, max-age=31536000, immutable
```

### 3. Turbopack (Dev)

El script `dev` ya incluye `--turbo` para desarrollo más rápido.

---

## Monitorización

### Recomendaciones

1. **Vercel Analytics** - Métricas de rendimiento
2. **Sentry** - Tracking de errores
3. **LogRocket** - Replay de sesiones

### Configuración de Sentry

```bash
bun add @sentry/nextjs
bunx @sentry/wizard@latest -i nextjs
```

---

## Checklist Pre-Producción

- [ ] Variables de entorno configuradas
- [ ] Imágenes de productos subidas al CDN
- [ ] API de backend lista
- [ ] Tests ejecutados
- [ ] Build de producción sin errores
- [ ] Lighthouse score > 90
- [ ] SSL/HTTPS configurado
- [ ] Dominio configurado
- [ ] Analytics implementado
- [ ] Error tracking activo

---

## Comandos Útiles

```bash
# Limpiar caché
rm -rf .next node_modules

# Reinstalar dependencias
bun install

# Verificar tipos TypeScript
bunx tsc --noEmit

# Lint
bun run lint

# Actualizar dependencias
bun update
```

---

## Ventajas de Bun

- **4x más rápido** que npm en instalación
- **Mejor resolución** de dependencias
- **Sin vulnerabilidades** heredadas de npm
- **Hot reload más rápido** en desarrollo
- **Compatible** con package.json y node_modules

---

## Soporte

Para problemas de despliegue, contactar:
- Email: dev@spheratile.com
- Documentación: /docs
