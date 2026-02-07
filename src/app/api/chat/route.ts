import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
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
    let ordersContext = ''
    let userContext = ''

    // Build user context
    if (userId) {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { nombre: true, email: true, empresa: true, telefono: true }
      })

      if (user) {
        userContext = `\n**INFORMACIÓN DEL USUARIO:**
- Nombre: ${user.nombre || userName}
- Email: ${user.email}
${user.empresa ? `- Empresa: ${user.empresa}` : ''}
${user.telefono ? `- Teléfono: ${user.telefono}` : ''}`
      }

      // Check if user is asking about orders
      const ordersKeywords = ['pedido', 'pedidos', 'orden', 'ordenes', 'compra', 'compras', 'historial', 'mis pedidos', 'estado']
      const wantsOrders = ordersKeywords.some(kw => userQuery.includes(kw))

      if (wantsOrders) {
        const orders = await prisma.pedido.findMany({
          where: { userId: userId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                producto: {
                  select: { nombre: true, referencia: true }
                }
              }
            }
          }
        })

        if (orders.length > 0) {
          ordersContext = `\n\n**PEDIDOS DEL USUARIO:**\n${orders.map(o => {
            const estadoLabel: Record<string, string> = {
              'PENDIENTE': 'Pendiente',
              'CONFIRMADO': 'Confirmado',
              'PREPARANDO': 'Preparando',
              'ENVIADO': 'Enviado',
              'ENTREGADO': 'Entregado',
              'CANCELADO': 'Cancelado'
            }

            const itemsStr = o.items.slice(0, 3).map((i: { producto: { nombre: string }; cantidad_cajas: number }) =>
              `  - ${i.producto.nombre} (${i.cantidad_cajas} cajas)`
            ).join('\n')

            return `- **Pedido #${o.numero_pedido}** (${new Date(o.createdAt).toLocaleDateString('es-ES')})
  Estado: ${estadoLabel[o.estado] || o.estado} | Total: ${o.total_euros.toFixed(2)}€
${itemsStr}${o.items.length > 3 ? `\n  ... y ${o.items.length - 3} productos más` : ''}`
          }).join('\n\n')}`
        } else {
          ordersContext = '\n\n**PEDIDOS DEL USUARIO:** No tiene pedidos todavía.'
        }
      }
    }

    // Search for products if query seems product-related
    const productKeywords = ['producto', 'cerámica', 'azulejo', 'porcelánico', 'gres', 'madera',
      'mármol', 'piedra', 'mate', 'pulido', 'antideslizante', 'suelo', 'pared', 'baño',
      'cocina', 'exterior', 'precio', 'stock', 'busco', 'necesito', 'quiero', 'tienes',
      'muestra', 'muéstrame', 'ver', 'disponible', 'recomienda', 'recomendación']

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
    const systemPrompt = `Eres el asistente virtual de SPHERA TILE, una tienda especializada en cerámica, azulejos, porcelánico y gres de alta calidad para profesionales.

SOBRE TI:
- Eres amable, profesional y servicial
- Ayudas con productos, pedidos, recomendaciones y cualquier consulta relacionada con SPHERA TILE
- Respondes en el mismo idioma que usa el usuario
- Sé conciso pero completo en tus respuestas

PUEDES AYUDAR CON:
- Buscar y recomendar productos de cerámica
- Consultar precios, stock y disponibilidad
- Información sobre pedidos del usuario (si está logueado)
- Características técnicas de productos
- Consejos para proyectos de reforma o decoración
- Información de contacto y horarios
- Dudas sobre envíos y entregas
- Calcular cuántas cajas necesita para ciertos m²

INFORMACIÓN DE CONTACTO:
- Teléfono: +34 633 909 095
- Horario: Lunes a Viernes 8:00 - 18:00
- Dirección: Avenida Del Mediterráneo 113, 12200 Onda, Castellón

${userId ? `**USUARIO IDENTIFICADO:** ${userName}${isAdmin ? ' (Administrador)' : ' (Cliente registrado)'}` : '**VISITANTE:** No ha iniciado sesión'}
${userContext}${ordersContext}${productContext}

Si el usuario pregunta sobre temas completamente ajenos a cerámica/construcción/decoración, redirige amablemente la conversación hacia cómo puedes ayudarle con productos o proyectos.`

    // Build Gemini conversation history
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const geminiHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({
      history: geminiHistory,
      systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessageStream(lastMessage.content)

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
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
