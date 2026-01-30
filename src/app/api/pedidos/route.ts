import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const busqueda = searchParams.get('busqueda')

    const where: any = {}

    if (estado && estado !== 'todos') {
      where.estado = estado.toUpperCase()
    }

    if (busqueda) {
      where.OR = [
        { numero_pedido: { contains: busqueda, mode: 'insensitive' } },
        { user: { nombre: { contains: busqueda, mode: 'insensitive' } } },
        { user: { empresa: { contains: busqueda, mode: 'insensitive' } } },
      ]
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        user: {
          select: {
            nombre: true,
            email: true,
            empresa: true,
            telefono: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ pedidos })
  } catch (error) {
    console.error('Error fetching pedidos:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

// POST - Crear pedido (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Generar número de pedido
    const count = await prisma.pedido.count()
    const numero_pedido = `PED-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    // Calcular totales
    const subtotal = data.items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
    const iva_euros = subtotal * (data.iva_porcentaje || 21) / 100
    const total_euros = subtotal + iva_euros
    const total_m2 = data.items.reduce((sum: number, item: any) => sum + item.cantidad_m2, 0)

    const pedido = await prisma.pedido.create({
      data: {
        numero_pedido,
        userId: data.userId,
        direccion_envio: data.direccion_envio,
        ciudad: data.ciudad,
        provincia: data.provincia,
        codigo_postal: data.codigo_postal,
        notas: data.notas,
        total_m2,
        subtotal_euros: subtotal,
        iva_porcentaje: data.iva_porcentaje || 21,
        iva_euros,
        total_euros,
        estado: 'PENDIENTE',
        items: {
          create: data.items.map((item: any) => ({
            productoId: item.productoId,
            producto_nombre: item.producto_nombre,
            producto_referencia: item.producto_referencia,
            cantidad_m2: item.cantidad_m2,
            cantidad_cajas: item.cantidad_cajas,
            precio_m2: item.precio_m2,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        user: true,
        items: true,
      },
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    console.error('Error creating pedido:', error)
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}
