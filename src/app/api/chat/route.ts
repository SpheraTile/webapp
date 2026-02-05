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
    const systemPrompt = `Eres el asistente virtual de SPHERA TILE, especializado en cerámica y azulejos. Ayudas a encontrar productos, dar información de precios y stock, y resolver dudas.

Sé amable, profesional y conciso. Responde en español.

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
