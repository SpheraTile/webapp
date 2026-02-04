import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email'

// POST - Crear pedido desde la cesta del usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Debes iniciar sesión para realizar un pedido' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Datos recibidos:', JSON.stringify(data, null, 2))

    // Obtener datos del usuario para la dirección
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Validar items
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'El pedido debe tener al menos un producto' }, { status: 400 })
    }

    // Generar número de pedido
    const count = await prisma.pedido.count()
    const numero_pedido = `PED-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    // Calcular totales (asegurar que son números válidos)
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (Number(item.subtotal) || 0), 0)
    const iva_porcentaje = 21
    const iva_euros = subtotal * iva_porcentaje / 100
    const total_euros = subtotal + iva_euros
    const total_m2 = data.items.reduce((sum: number, item: any) => sum + (Number(item.cantidad_m2) || 0), 0)

    // Usar dirección del usuario o la proporcionada
    const direccion_envio = data.direccion_envio || user.direccion || ''
    const ciudad = data.ciudad || user.ciudad || ''
    const provincia = data.provincia || user.provincia || ''
    const codigo_postal = data.codigo_postal || user.codigo_postal || ''

    if (!direccion_envio || !ciudad || !codigo_postal) {
      return NextResponse.json({
        error: 'Debes completar tu dirección de envío en tu perfil o proporcionar una'
      }, { status: 400 })
    }

    // Verificar que todos los productos existen en la base de datos
    const productIds = data.items.map((item: any) => item.productoId).filter(Boolean)
    const existingProducts = await prisma.producto.findMany({
      where: { id: { in: productIds } },
      select: { id: true }
    })
    const existingProductIds = new Set(existingProducts.map(p => p.id))

    const missingProducts = productIds.filter((id: string) => !existingProductIds.has(id))
    if (missingProducts.length > 0) {
      console.log('Productos no encontrados:', missingProducts)
      return NextResponse.json({
        error: 'Algunos productos ya no están disponibles. Por favor, vacía la cesta y vuelve a añadir los productos.',
        details: `Productos no encontrados: ${missingProducts.join(', ')}`
      }, { status: 400 })
    }

    // Validar que los items tengan datos válidos
    const itemsValidados = data.items.map((item: any) => {
      const cantidad_cajas = Math.ceil(item.cantidad_cajas || 1)
      if (!item.productoId) {
        throw new Error('Falta productoId en un item')
      }
      return {
        productoId: item.productoId,
        producto_nombre: item.producto_nombre || 'Producto',
        producto_referencia: item.producto_referencia || '',
        cantidad_m2: Number(item.cantidad_m2) || 0,
        cantidad_cajas: Number.isFinite(cantidad_cajas) ? cantidad_cajas : 1,
        precio_m2: Number(item.precio_m2) || 0,
        subtotal: Number(item.subtotal) || 0,
      }
    })

    const pedido = await prisma.pedido.create({
      data: {
        numero_pedido,
        userId: session.user.id,
        direccion_envio,
        ciudad,
        provincia,
        codigo_postal,
        notas: data.notas || '',
        total_m2,
        subtotal_euros: subtotal,
        iva_porcentaje,
        iva_euros,
        total_euros,
        estado: 'PENDIENTE',
        items: {
          create: itemsValidados,
        },
      },
      include: {
        items: true,
      },
    })

    // Enviar email de confirmación
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const pedidoUrl = `${baseUrl}/cuenta/pedidos/${pedido.id}`
      const totalFormatted = total_euros.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

      const emailContent = getOrderConfirmationEmail(
        user.nombre,
        numero_pedido,
        totalFormatted,
        pedidoUrl
      )

      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      })
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // No fallar el pedido si el email falla
    }

    return NextResponse.json(pedido, { status: 201 })
  } catch (error: any) {
    console.error('Error creating pedido:', error)
    console.error('Error details:', error?.message, error?.code, error?.meta)
    return NextResponse.json({
      error: 'Error al crear el pedido',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Obtener pedidos del usuario actual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const where: any = {
      userId: session.user.id,
    }

    if (estado && estado !== 'todos') {
      where.estado = estado.toUpperCase()
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        items: {
          include: {
            producto: {
              select: {
                imagen: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ pedidos })
  } catch (error) {
    console.error('Error fetching mis pedidos:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}
