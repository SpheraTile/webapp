import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener factura por ID (solo si pertenece al usuario)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const factura = await prisma.factura.findUnique({
      where: { id },
      include: {
        items: true,
        pedido: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
            items: {
              include: {
                producto: {
                  select: {
                    slug: true,
                    imagen: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!factura) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // Verificar que la factura pertenece al usuario actual
    if (factura.pedido.user.id !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Si la factura no tiene items propios, crear items temporales desde el pedido
    if (!factura.items || factura.items.length === 0) {
      const itemsFromPedido = factura.pedido.items.map((item: any) => ({
        id: item.id,
        producto_nombre: item.producto_nombre,
        producto_referencia: item.producto_referencia,
        producto_slug: item.producto?.slug || null,
        producto_imagen: item.producto?.imagen || null,
        cantidad_m2: item.cantidad_m2,
        cantidad_cajas: item.cantidad_cajas,
        precio_m2: item.precio_m2,
        subtotal: item.subtotal,
      }))
      ;(factura as any).items = itemsFromPedido
    }

    // Excluir datos sensibles del usuario
    const { pedido, ...facturaData } = factura
    const safeFactura = {
      ...facturaData,
      pedido: {
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
      },
    }

    return NextResponse.json(safeFactura)
  } catch (error) {
    console.error('Error fetching factura:', error)
    return NextResponse.json({ error: 'Error al obtener factura' }, { status: 500 })
  }
}
