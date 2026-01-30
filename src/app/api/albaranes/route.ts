import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar albaranes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const where: any = {}

    if (estado && estado !== 'todos') {
      where.estado = estado.toUpperCase()
    }

    const albaranes = await prisma.albaran.findMany({
      where,
      include: {
        pedido: {
          include: {
            user: {
              select: {
                nombre: true,
                empresa: true,
              },
            },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ albaranes })
  } catch (error) {
    console.error('Error fetching albaranes:', error)
    return NextResponse.json({ error: 'Error al obtener albaranes' }, { status: 500 })
  }
}

// POST - Crear albarán desde pedido (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Verificar que el pedido existe y no tiene albarán
    const pedido = await prisma.pedido.findUnique({
      where: { id: data.pedidoId },
      include: { albaran: true, items: true, user: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (pedido.albaran) {
      return NextResponse.json({ error: 'Este pedido ya tiene un albarán' }, { status: 400 })
    }

    // Generar número de albarán
    const count = await prisma.albaran.count()
    const numero_albaran = `ALB-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    // Calcular totales
    const total_cajas = pedido.items.reduce((sum, item) => sum + item.cantidad_cajas, 0)
    const peso_total_kg = total_cajas * 25 // Estimación

    const albaran = await prisma.albaran.create({
      data: {
        numero_albaran,
        pedidoId: data.pedidoId,
        direccion_entrega: data.direccion_entrega || `${pedido.direccion_envio}, ${pedido.codigo_postal} ${pedido.ciudad}`,
        total_m2: pedido.total_m2,
        total_cajas,
        peso_total_kg,
        estado: 'BORRADOR',
        transportista: data.transportista,
        matricula: data.matricula,
        notas: data.notas,
      },
      include: {
        pedido: {
          include: {
            user: true,
            items: true,
          },
        },
      },
    })

    // Actualizar estado del pedido
    await prisma.pedido.update({
      where: { id: data.pedidoId },
      data: { estado: 'PREPARANDO' },
    })

    return NextResponse.json(albaran, { status: 201 })
  } catch (error) {
    console.error('Error creating albaran:', error)
    return NextResponse.json({ error: 'Error al crear albarán' }, { status: 500 })
  }
}
