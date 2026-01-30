import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener albarán por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const albaran = await prisma.albaran.findUnique({
      where: { id },
      include: {
        pedido: {
          include: {
            user: true,
            items: {
              include: {
                producto: true,
              },
            },
          },
        },
      },
    })

    if (!albaran) {
      return NextResponse.json({ error: 'Albarán no encontrado' }, { status: 404 })
    }

    return NextResponse.json(albaran)
  } catch (error) {
    console.error('Error fetching albaran:', error)
    return NextResponse.json({ error: 'Error al obtener albarán' }, { status: 500 })
  }
}

// PUT - Actualizar albarán (solo admin)
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

    const albaran = await prisma.albaran.findUnique({
      where: { id },
      include: { pedido: true },
    })

    if (!albaran) {
      return NextResponse.json({ error: 'Albarán no encontrado' }, { status: 404 })
    }

    const updatedAlbaran = await prisma.albaran.update({
      where: { id },
      data: {
        estado: data.estado,
        transportista: data.transportista,
        matricula: data.matricula,
        notas: data.notas,
        fecha_entrega: data.estado === 'ENTREGADO' ? new Date() : data.fecha_entrega,
      },
    })

    // Actualizar estado del pedido según el albarán
    if (data.estado === 'EMITIDO') {
      await prisma.pedido.update({
        where: { id: albaran.pedidoId },
        data: { estado: 'ENVIADO' },
      })
    } else if (data.estado === 'ENTREGADO') {
      await prisma.pedido.update({
        where: { id: albaran.pedidoId },
        data: { estado: 'ENTREGADO' },
      })
    }

    return NextResponse.json(updatedAlbaran)
  } catch (error) {
    console.error('Error updating albaran:', error)
    return NextResponse.json({ error: 'Error al actualizar albarán' }, { status: 500 })
  }
}

// DELETE - Eliminar albarán (solo admin, solo si está en borrador)
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

    const albaran = await prisma.albaran.findUnique({ where: { id } })

    if (!albaran) {
      return NextResponse.json({ error: 'Albarán no encontrado' }, { status: 404 })
    }

    if (albaran.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar albaranes en estado borrador' },
        { status: 400 }
      )
    }

    await prisma.albaran.delete({ where: { id } })

    // Volver el pedido a confirmado
    await prisma.pedido.update({
      where: { id: albaran.pedidoId },
      data: { estado: 'CONFIRMADO' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting albaran:', error)
    return NextResponse.json({ error: 'Error al eliminar albarán' }, { status: 500 })
  }
}
