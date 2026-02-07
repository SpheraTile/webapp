import { GoogleGenerativeAI } from '@google/generative-ai'
import { neon } from '@neondatabase/serverless'

// Lazy initialization to avoid errors during build
let genAIClient: GoogleGenerativeAI | null = null
function getGenAI(): GoogleGenerativeAI {
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }
  return genAIClient
}

// Create Neon SQL client for raw queries (pgvector) - lazy
let sqlClient: ReturnType<typeof neon> | null = null
function getSQL() {
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL!)
  }
  return sqlClient
}

// Generate embedding for a text using Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  const result = await model.embedContent(text)
  return result.embedding.values
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

// Migrate vector column from 1536 (OpenAI) to 768 (Gemini) dimensions
async function migrateVectorDimensions(): Promise<void> {
  const sql = getSQL()
  // Clear existing embeddings (they're incompatible with new dimensions)
  await sql`UPDATE "Producto" SET embedding = NULL`
  // Drop old index
  await sql`DROP INDEX IF EXISTS "Producto_embedding_idx"`
  // Alter column to new dimension
  await sql`ALTER TABLE "Producto" ALTER COLUMN embedding TYPE vector(768)`
  // Recreate index
  await sql`CREATE INDEX IF NOT EXISTS "Producto_embedding_idx" ON "Producto" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100)`
  // Update the search function
  await sql`
    CREATE OR REPLACE FUNCTION search_products_by_embedding(
      query_embedding vector(768),
      match_threshold float DEFAULT 0.7,
      match_count int DEFAULT 10
    )
    RETURNS TABLE (
      id text,
      nombre text,
      referencia text,
      serie text,
      descripcion text,
      formato text,
      precio_m2 float,
      stock_m2 float,
      imagen text,
      similarity float
    )
    LANGUAGE plpgsql
    AS $func$
    BEGIN
      RETURN QUERY
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
        1 - (p.embedding <=> query_embedding) as similarity
      FROM "Producto" p
      WHERE p.embedding IS NOT NULL
        AND 1 - (p.embedding <=> query_embedding) > match_threshold
      ORDER BY p.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $func$
  `
}

// Batch update all product embeddings
export async function updateAllProductEmbeddings(): Promise<{ updated: number; errors: string[]; migrated: boolean }> {
  const sql = getSQL()

  // Check current vector dimension and migrate if needed
  let migrated = false
  try {
    const dimCheck = await sql`
      SELECT atttypmod FROM pg_attribute
      WHERE attrelid = '"Producto"'::regclass
        AND attname = 'embedding'
    ` as Record<string, number>[]
    // atttypmod for vector(1536) is 1540 (dim + 4), for vector(768) is 772
    if (dimCheck.length > 0 && dimCheck[0].atttypmod !== 772) {
      await migrateVectorDimensions()
      migrated = true
    }
  } catch {
    // If check fails, try migration anyway
    try {
      await migrateVectorDimensions()
      migrated = true
    } catch {
      // Column might already be correct
    }
  }

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

  return { updated, errors, migrated }
}
