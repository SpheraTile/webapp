import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar facturas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')

    const where: any = {}

    if (estado && estado !== 'todos') {
      where.estado = estado.toUpperCase()
    }

    const facturas = await prisma.factura.findMany({
      where,
      include: {
        pedido: {
          include: {
            user: {
              select: {
                nombre: true,
                empresa: true,
                nif_cif: true,
              },
            },
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ facturas })
  } catch (error) {
    console.error('Error fetching facturas:', error)
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 })
  }
}

// POST - Crear factura desde pedido (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Verificar que el pedido existe y no tiene factura
    const pedido = await prisma.pedido.findUnique({
      where: { id: data.pedidoId },
      include: { factura: true, user: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (pedido.factura) {
      return NextResponse.json({ error: 'Este pedido ya tiene una factura' }, { status: 400 })
    }

    // Generar número de factura
    const count = await prisma.factura.count()
    const numero_factura = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`

    // Fecha de vencimiento (30 días por defecto)
    const fecha_vencimiento = new Date()
    fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30)

    const factura = await prisma.factura.create({
      data: {
        numero_factura,
        pedidoId: data.pedidoId,
        direccion_facturacion: data.direccion_facturacion || `${pedido.direccion_envio}, ${pedido.codigo_postal} ${pedido.ciudad}`,
        subtotal_euros: pedido.subtotal_euros,
        iva_porcentaje: pedido.iva_porcentaje,
        iva_euros: pedido.iva_euros,
        total_euros: pedido.total_euros,
        estado: 'BORRADOR',
        metodo_pago: data.metodo_pago || 'TRANSFERENCIA',
        fecha_vencimiento,
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

    return NextResponse.json(factura, { status: 201 })
  } catch (error) {
    console.error('Error creating factura:', error)
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 })
  }
}
