import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener factura por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const factura = await prisma.factura.findUnique({
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

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    return NextResponse.json(factura)
  } catch (error) {
    console.error('Error fetching factura:', error)
    return NextResponse.json({ error: 'Error al obtener factura' }, { status: 500 })
  }
}

// PUT - Actualizar factura (solo admin)
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

    const factura = await prisma.factura.findUnique({ where: { id } })

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    const updatedFactura = await prisma.factura.update({
      where: { id },
      data: {
        estado: data.estado,
        metodo_pago: data.metodo_pago,
        notas: data.notas,
        fecha_pago: data.estado === 'PAGADA' ? new Date() : data.fecha_pago,
      },
    })

    return NextResponse.json(updatedFactura)
  } catch (error) {
    console.error('Error updating factura:', error)
    return NextResponse.json({ error: 'Error al actualizar factura' }, { status: 500 })
  }
}

// DELETE - Eliminar factura (solo admin, solo si está en borrador)
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

    const factura = await prisma.factura.findUnique({ where: { id } })

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    if (factura.estado !== 'BORRADOR') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar facturas en estado borrador' },
        { status: 400 }
      )
    }

    await prisma.factura.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting factura:', error)
    return NextResponse.json({ error: 'Error al eliminar factura' }, { status: 500 })
  }
}
