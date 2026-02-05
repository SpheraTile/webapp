import OpenAI from 'openai'
import { neon } from '@neondatabase/serverless'

// Lazy initialization to avoid errors during build
let openaiClient: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

// Create Neon SQL client for raw queries (pgvector) - lazy
let sqlClient: ReturnType<typeof neon> | null = null
function getSQL() {
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL!)
  }
  return sqlClient
}

// Generate embedding for a text
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI()
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

// Create searchable text from product data
export function createProductSearchText(product: {
  nombre: string
  serie: string
  descripcion?: string | null
  formato: string
  calidad: string
  materia_prima: string
  aspecto: string
  acabado: string
  tipo_pieza: string
  uso: string
}): string {
  const parts = [
    product.nombre,
    `Serie ${product.serie}`,
    product.descripcion || '',
    `Formato ${product.formato}`,
    `Calidad ${product.calidad === 'COM' ? 'Comercial' : 'Primera'}`,
    getMaterialLabel(product.materia_prima),
    getAspectLabel(product.aspecto),
    getFinishLabel(product.acabado),
    getPieceTypeLabel(product.tipo_pieza),
    getUsageLabel(product.uso),
  ]
  return parts.filter(Boolean).join('. ')
}

// Helper functions for readable labels
function getMaterialLabel(material: string): string {
  const labels: Record<string, string> = {
    PORCELANICO: 'Porcelánico, cerámica resistente de alta calidad',
    GRES: 'Gres, cerámica durable para suelos',
    AZULEJO: 'Azulejo, baldosa cerámica esmaltada',
  }
  return labels[material] || material
}

function getAspectLabel(aspect: string): string {
  const labels: Record<string, string> = {
    BLANCO: 'Aspecto blanco, color neutro',
    CEMENTO: 'Aspecto cemento, estilo industrial',
    COLORES: 'Aspecto colorido, decorativo',
    MADERA: 'Aspecto madera, imitación madera natural',
    MARMOL: 'Aspecto mármol, elegante piedra natural',
    PIEDRA: 'Aspecto piedra, textura natural',
    TERRACOTA: 'Aspecto terracota, estilo rústico mediterráneo',
  }
  return labels[aspect] || aspect
}

function getFinishLabel(finish: string): string {
  const labels: Record<string, string> = {
    MATE: 'Acabado mate, sin brillo',
    PULIDO: 'Acabado pulido, brillante',
    SATINADO: 'Acabado satinado, semi-brillo',
    TEXTURIZADO: 'Acabado texturizado, relieve',
    ANTIDESLIZANTE: 'Acabado antideslizante, seguro para zonas húmedas',
  }
  return labels[finish] || finish
}

function getPieceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BASE: 'Pieza base, baldosa principal',
    DECORADO: 'Pieza decorada, con diseño',
    MULTISTEP: 'Pieza multistep, escalera',
  }
  return labels[type] || type
}

function getUsageLabel(usage: string): string {
  const labels: Record<string, string> = {
    PAVIMENTO: 'Para pavimento, suelo',
    REVESTIMIENTO: 'Para revestimiento, pared',
    PAVIMENTO_REVESTIMIENTO: 'Para pavimento y revestimiento, suelo y pared',
  }
  return labels[usage] || usage
}

// Generate and store embedding for a product
export async function updateProductEmbedding(productId: string, product: Parameters<typeof createProductSearchText>[0]): Promise<void> {
  const searchText = createProductSearchText(product)
  const embedding = await generateEmbedding(searchText)

  // Store embedding in database using raw SQL (Prisma doesn't support vector type)
  const sql = getSQL()
  await sql`
    UPDATE "Producto"
    SET embedding = ${JSON.stringify(embedding)}::vector
    WHERE id = ${productId}
  `
}

// Search products by semantic similarity
export async function searchProductsBySimilarity(
  query: string,
  threshold = 0.5,
  limit = 10
): Promise<Array<{
  id: string
  nombre: string
  referencia: string
  serie: string
  descripcion: string | null
  formato: string
  precio_m2: number
  stock_m2: number
  imagen: string
  similarity: number
}>> {
  const queryEmbedding = await generateEmbedding(query)
  const sql = getSQL()

  const results = await sql`
    SELECT
      p.id,
      p.nombre,
      p.referencia,
      p.serie,
      p.descripcion,
      p.formato,
      p.precio_m2,
      p.stock_m2,
      p.imagen,
      1 - (p.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
    FROM "Producto" p
    WHERE p.embedding IS NOT NULL
      AND 1 - (p.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${threshold}
    ORDER BY p.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `

  return results as Array<{
    id: string
    nombre: string
    referencia: string
    serie: string
    descripcion: string | null
    formato: string
    precio_m2: number
    stock_m2: number
    imagen: string
    similarity: number
  }>
}

// Get product recommendations based on order history
export async function getRecommendationsForUser(userId: string, limit = 5): Promise<Array<{
  id: string
  nombre: string
  referencia: string
  serie: string
  imagen: string
  precio_m2: number
  stock_m2: number
  reason: string
}>> {
  const sql = getSQL()

  // Get products from user's order history
  const orderHistoryResult = await sql`
    SELECT DISTINCT
      p.id,
      p.nombre,
      p.serie,
      p.aspecto,
      p.materia_prima,
      COUNT(*) as order_count
    FROM "ItemPedido" ip
    JOIN "Pedido" ped ON ip."pedidoId" = ped.id
    JOIN "Producto" p ON ip."productoId" = p.id
    WHERE ped."userId" = ${userId}
    GROUP BY p.id, p.nombre, p.serie, p.aspecto, p.materia_prima
    ORDER BY order_count DESC
    LIMIT 5
  `
  const orderHistory = orderHistoryResult as Array<Record<string, unknown>>

  if (orderHistory.length === 0) {
    // Return popular products if no order history
    const popularResult = await sql`
      SELECT
        p.id,
        p.nombre,
        p.referencia,
        p.serie,
        p.imagen,
        p.precio_m2,
        p.stock_m2
      FROM "Producto" p
      WHERE p.stock_m2 > 0
      ORDER BY p."createdAt" DESC
      LIMIT ${limit}
    `
    const popular = popularResult as Array<Record<string, unknown>>
    return popular.map((p) => ({
      ...p,
      reason: 'Producto destacado'
    })) as Array<{
      id: string
      nombre: string
      referencia: string
      serie: string
      imagen: string
      precio_m2: number
      stock_m2: number
      reason: string
    }>
  }

  // Find similar products based on order history
  const seriesAndAspects = orderHistory.map((h) => ({
    serie: h.serie as string,
    aspecto: h.aspecto as string
  }))

  const recommendations = await sql`
    SELECT DISTINCT
      p.id,
      p.nombre,
      p.referencia,
      p.serie,
      p.imagen,
      p.precio_m2,
      p.stock_m2,
      CASE
        WHEN p.serie = ANY(${seriesAndAspects.map((s) => s.serie)}) THEN 'De tu serie favorita'
        WHEN p.aspecto = ANY(${seriesAndAspects.map((s) => s.aspecto)}) THEN 'Estilo similar a tus compras'
        ELSE 'Te puede interesar'
      END as reason
    FROM "Producto" p
    WHERE p.stock_m2 > 0
      AND p.id NOT IN (
        SELECT ip."productoId"
        FROM "ItemPedido" ip
        JOIN "Pedido" ped ON ip."pedidoId" = ped.id
        WHERE ped."userId" = ${userId}
      )
      AND (
        p.serie = ANY(${seriesAndAspects.map((s) => s.serie)})
        OR p.aspecto = ANY(${seriesAndAspects.map((s) => s.aspecto)})
      )
    ORDER BY
      CASE WHEN p.serie = ANY(${seriesAndAspects.map((s) => s.serie)}) THEN 0 ELSE 1 END,
      p.stock_m2 DESC
    LIMIT ${limit}
  `

  return recommendations as Array<{
    id: string
    nombre: string
    referencia: string
    serie: string
    imagen: string
    precio_m2: number
    stock_m2: number
    reason: string
  }>
}

// Batch update all product embeddings
export async function updateAllProductEmbeddings(): Promise<{ updated: number; errors: string[] }> {
  const sql = getSQL()
  const productsResult = await sql`
    SELECT id, nombre, serie, descripcion, formato, calidad, materia_prima, aspecto, acabado, tipo_pieza, uso
    FROM "Producto"
  `
  const products = productsResult as Array<Record<string, unknown>>

  let updated = 0
  const errors: string[] = []

  for (const product of products) {
    try {
      await updateProductEmbedding(product.id as string, product as Parameters<typeof createProductSearchText>[0])
      updated++
    } catch (error) {
      errors.push(`Error updating ${product.id}: ${error}`)
    }
  }

  return { updated, errors }
}
