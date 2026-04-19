import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
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
  slug: string
  descripcion?: string | null
  calidad?: string
  materia_prima?: string
  aspecto?: string
  acabado?: string
}) {
  let text = '- **' + product.nombre + '** (Ref: ' + product.referencia + ')\n'
  text += '  Serie: ' + product.serie + ' | Formato: ' + product.formato + '\n'
  text += '  Precio: ' + product.precio_m2.toFixed(2) + ' €/m² | Stock: ' + product.stock_m2.toFixed(2) + ' m²\n'
  text += '  🔗 Ver: https://app.spheratile.es/productos/' + product.slug + '\n'
  if (product.calidad) {
    text += '  Calidad: ' + (product.calidad === 'COM' ? 'Comercial' : 'Primera') + '\n'
  }
  if (product.materia_prima) text += '  Material: ' + product.materia_prima + '\n'
  if (product.aspecto) text += '  Aspecto: ' + product.aspecto + '\n'
  if (product.acabado) text += '  Acabado: ' + product.acabado
  return text
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
        userContext = '\n\n**INFORMACIÓN DEL USUARIO:**\n'
        userContext += '- Nombre: ' + (user.nombre || userName) + '\n'
        userContext += '- Email: ' + user.email + '\n'
        if (user.empresa) userContext += '- Empresa: ' + user.empresa + '\n'
        if (user.telefono) userContext += '- Teléfono: ' + user.telefono
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
          ordersContext = '\n\n**PEDIDOS DEL USUARIO:**\n'
          ordersContext += orders.map(o => {
            const estadoLabel: Record<string, string> = {
              'PENDIENTE': 'Pendiente',
              'CONFIRMADO': 'Confirmado',
              'PREPARANDO': 'Preparando',
              'ENVIADO': 'Enviado',
              'ENTREGADO': 'Entregado',
              'CANCELADO': 'Cancelado'
            }

            const itemsStr = o.items.slice(0, 3).map((i: { producto: { nombre: string }; cantidad_cajas: number }) =>
              '  - ' + i.producto.nombre + ' (' + i.cantidad_cajas + ' cajas)'
            ).join('\n')

            let orderText = '- **Pedido #' + o.numero_pedido + '** (' + new Date(o.createdAt).toLocaleDateString('es-ES') + ')\n'
            orderText += '  Estado: ' + (estadoLabel[o.estado] || o.estado) + ' | Total: ' + o.total_euros.toFixed(2) + '€\n'
            orderText += itemsStr
            if (o.items.length > 3) orderText += '\n  ... y ' + (o.items.length - 3) + ' productos más'
            return orderText
          }).join('\n\n')
        } else {
          ordersContext = '\n\n**PEDIDOS DEL USUARIO:** No tiene pedidos todavía.'
        }
      }
    }

    // Search for products - always search unless clearly unrelated
    const unrelatedKeywords = ['hola', 'adios', 'gracias', 'buenos dias', 'buenas tardes', 'buenas noches']
    const isUnrelated = unrelatedKeywords.some(kw => userQuery.includes(kw))

    if (!isUnrelated && userQuery.length > 2) {
      // Build search filters based on query - make them optional with OR conditions
      const filters: Record<string, unknown>[] = []

      // Base filter: products with stock
      const baseFilter = { stock_m2: { gt: 0 } }

      // Add optional filters for more flexible search
      if (userQuery.includes('madera')) {
        filters.push({ ...baseFilter, aspecto: 'MADERA' })
      }
      if (userQuery.includes('mármol') || userQuery.includes('marmol')) {
        filters.push({ ...baseFilter, aspecto: 'MARMOL' })
      }
      if (userQuery.includes('piedra')) {
        filters.push({ ...baseFilter, aspecto: 'PIEDRA' })
      }
      if (userQuery.includes('cemento')) {
        filters.push({ ...baseFilter, aspecto: 'CEMENTO' })
      }
      if (userQuery.includes('blanco')) {
        filters.push({ ...baseFilter, aspecto: 'BLANCO' })
      }
      if (userQuery.includes('antideslizante')) {
        filters.push({ ...baseFilter, acabado: 'ANTIDESLIZANTE' })
      }
      if (userQuery.includes('mate')) {
        filters.push({ ...baseFilter, acabado: 'MATE' })
      }
      if (userQuery.includes('pulido')) {
        filters.push({ ...baseFilter, acabado: 'PULIDO' })
      }
      if (userQuery.includes('porcelánico') || userQuery.includes('porcelanico')) {
        filters.push({ ...baseFilter, materia_prima: 'PORCELANICO' })
      }
      if (userQuery.includes('gres')) {
        filters.push({ ...baseFilter, materia_prima: 'GRES' })
      }
      if (userQuery.includes('azulejo')) {
        filters.push({ ...baseFilter, materia_prima: 'AZULEJO' })
      }

      // If no specific filters, get all products with stock
      const searchFilter = filters.length > 0 ? { OR: filters } : baseFilter

      const products = await prisma.producto.findMany({
        where: searchFilter,
        take: 30,
        orderBy: { stock_m2: 'desc' },
        select: {
          nombre: true,
          referencia: true,
          serie: true,
          formato: true,
          precio_m2: true,
          stock_m2: true,
          imagen: true,
          slug: true,
          calidad: true,
          materia_prima: true,
          aspecto: true,
          acabado: true,
        },
      })

      if (products.length > 0) {
        productContext = '\n\n**PRODUCTOS ENCONTRADOS (' + products.length + '):**\n'
        productContext += products.map(p => formatProductForPrompt(p)).join('\n\n')
      }
    }

    // Build system prompt
    const userInfo = userId ? 'USUARIO: ' + userName + (isAdmin ? ' (Admin)' : '') : 'VISITANTE'
    const systemPrompt = 'Eres el asistente virtual de SPHERA TILE, una empresa de cerámica con más de 30 años de experiencia en Onda (Castellón). Tu tono es cercano, profesional y servicial.\n\nINSTRUCCIONES DE COMUNICACIÓN:\n- Sé amable y conversacional, usa frases completas y naturales\n- Puedes usar emojis moderadamente 😊 para hacer el texto más amigable\n- Da respuestas más detalladas cuando el usuario pida información sobre productos\n- Ofrece siempre ayuda adicional al final de cada respuesta\n- Evita ser demasiado breve o seco\n- **IMPORTANTE**: Cuando menciones productos, SIEMPRE incluye el enlace directo como "[nombre del producto](https://app.spheratile.es/productos/slug)" para que el usuario pueda hacer clic y ver el producto\n\nREGLAS ESTRICTAS:\n1. SOLO informativo: NO puedes crear pedidos, reservar stock, procesar pagos\n2. Para acciones (pedidos, compras), recomienda usar la web o llamar al +34 633 909 095\n3. Usa SOLO la información del contexto de productos. NO inventes datos, precios o stock\n4. Si no tienes información sobre algo, sugiere contactar con el equipo comercial\n5. Para temas no relacionados con cerámica, redirige amablemente al tema de SPHERA TILE\n\nINFORMACIÓN DISPONIBLE:\n- Productos del catálogo (nombre, referencia, formato, precio, stock, material, acabado, ENLACE)\n- Pedidos del usuario (si está logueado)\n- Información de contacto y horarios\n\nCONTACTO COMERCIAL:\n- Tel: +34 633 909 095 | L-V 8:00-18:00\n- Email: info@spheratile.es\n- Dirección: Avda. Mediterráneo 113, 12200 Onda, Castellón\n- Web: app.spheratile.es\n\n' + userInfo + userContext + ordersContext + productContext

    // Filter out welcome assistant message (first message is always the bot greeting)
    const chatMessages = messages.filter((m: { role: string; id?: string }) =>
      !(m.role === 'assistant' && m.id === 'welcome')
    )

    // Build OpenAI messages
    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...chatMessages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    })

    // Create a ReadableStream for the response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
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
    return NextResponse.json({ error: 'Error: ' + errorMessage }, { status: 500 })
  }
}
