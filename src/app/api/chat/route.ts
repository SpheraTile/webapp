import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || 'https://spheratile.b-cdn.net'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting - store requests per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 20 // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute window

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}, 60 * 1000)

// Format product for display
function formatProductForPrompt(product: {
  nombre: string
  referencia: string
  serie: string
  formato: string
  precio_m2: number
  stock_m2: number
  imagen: string
  descripcion?: string | null
  calidad?: string
  materia_prima?: string
  aspecto?: string
  acabado?: string
}) {
  return `- **${product.nombre}** (Ref: ${product.referencia})
  Serie: ${product.serie} | Formato: ${product.formato}
  Precio: ${product.precio_m2.toFixed(2)} €/m² | Stock: ${product.stock_m2.toFixed(2)} m²
  ${product.calidad ? `Calidad: ${product.calidad === 'COM' ? 'Comercial' : 'Primera'}` : ''}
  ${product.materia_prima ? `Material: ${product.materia_prima}` : ''}
  ${product.aspecto ? `Aspecto: ${product.aspecto}` : ''}
  ${product.acabado ? `Acabado: ${product.acabado}` : ''}`
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Por favor, espera un momento.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userName = session?.user?.name || 'Cliente'
    const isAdmin = session?.user?.role === 'ADMIN'

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }

    // Get the last user message to understand intent
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop()
    const userQuery = (lastUserMessage?.content || '').toLowerCase()

    // Prepare context based on user query
    let productContext = ''

    // Search for products if query seems product-related
    const productKeywords = ['producto', 'cerámica', 'azulejo', 'porcelánico', 'gres', 'madera',
      'mármol', 'piedra', 'mate', 'pulido', 'antideslizante', 'suelo', 'pared', 'baño',
      'cocina', 'exterior', 'precio', 'stock', 'busco', 'necesito', 'quiero', 'tienes',
      'muestra', 'muéstrame', 'ver', 'disponible']

    const wantsProducts = productKeywords.some(kw => userQuery.includes(kw))

    if (wantsProducts) {
      // Build search filters based on query
      const filters: Record<string, unknown> = { stock_m2: { gt: 0 } }

      if (userQuery.includes('madera')) filters.aspecto = 'MADERA'
      else if (userQuery.includes('mármol') || userQuery.includes('marmol')) filters.aspecto = 'MARMOL'
      else if (userQuery.includes('piedra')) filters.aspecto = 'PIEDRA'
      else if (userQuery.includes('cemento')) filters.aspecto = 'CEMENTO'
      else if (userQuery.includes('blanco')) filters.aspecto = 'BLANCO'

      if (userQuery.includes('antideslizante')) filters.acabado = 'ANTIDESLIZANTE'
      else if (userQuery.includes('mate')) filters.acabado = 'MATE'
      else if (userQuery.includes('pulido')) filters.acabado = 'PULIDO'

      if (userQuery.includes('porcelánico') || userQuery.includes('porcelanico')) filters.materia_prima = 'PORCELANICO'
      else if (userQuery.includes('gres')) filters.materia_prima = 'GRES'
      else if (userQuery.includes('azulejo')) filters.materia_prima = 'AZULEJO'

      const products = await prisma.producto.findMany({
        where: filters,
        take: 5,
        orderBy: { stock_m2: 'desc' },
      })

      if (products.length > 0) {
        productContext = `\n\n**PRODUCTOS ENCONTRADOS:**\n${products.map(p => formatProductForPrompt(p)).join('\n\n')}`
      }
    }

    // Build system prompt
    const systemPrompt = `Eres el asistente virtual de SPHERA TILE, especializado EXCLUSIVAMENTE en cerámica, azulejos y productos de nuestra tienda.

REGLAS ESTRICTAS:
1. SOLO puedes responder preguntas sobre:
   - Productos de cerámica, azulejos, porcelánico, gres
   - Precios, stock y disponibilidad de productos
   - Formatos, acabados, materiales y características técnicas
   - Recomendaciones de productos para proyectos
   - Información sobre pedidos y envíos
   - Horarios y contacto de SPHERA TILE

2. Si el usuario pregunta sobre CUALQUIER otro tema (política, deportes, recetas, programación, matemáticas, historia, etc.):
   - Responde amablemente: "Lo siento, soy el asistente de SPHERA TILE y solo puedo ayudarte con temas relacionados con cerámica y nuestros productos. ¿Puedo ayudarte a encontrar algún producto?"

3. NO generes contenido ofensivo, no des consejos médicos/legales/financieros.

4. Sé amable, profesional y conciso. Responde en el idioma del usuario.

5. Si no tienes información de un producto específico, sugiere contactar por teléfono (+34 633 909 095) o email.

Usuario: ${userName} (${isAdmin ? 'Admin' : userId ? 'Cliente' : 'Visitante'})
${productContext}`

    // Call OpenAI API with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      stream: true,
    })

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Error: ${errorMessage}` }, { status: 500 })
  }
}
