import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener pedido por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            producto: true,
          },
        },
        albaran: true,
        factura: true,
      },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error fetching pedido:', error)
    return NextResponse.json({ error: 'Error al obtener pedido' }, { status: 500 })
  }
}

// PUT - Actualizar pedido (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        estado: data.estado,
        direccion_envio: data.direccion_envio,
        ciudad: data.ciudad,
        provincia: data.provincia,
        codigo_postal: data.codigo_postal,
        notas: data.notas,
      },
      include: {
        user: true,
        items: true,
      },
    })

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('Error updating pedido:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}

// DELETE - Eliminar pedido (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que no tenga albarán o factura
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { albaran: true, factura: true },
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (pedido.albaran || pedido.factura) {
      return NextResponse.json(
        { error: 'No se puede eliminar un pedido con albarán o factura asociado' },
        { status: 400 }
      )
    }

    // Eliminar items primero
    await prisma.itemPedido.deleteMany({ where: { pedidoId: id } })
    await prisma.pedido.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pedido:', error)
    return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 })
  }
}
