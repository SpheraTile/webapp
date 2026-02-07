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
                nombre: true,
                codigo_cliente: true,
                pais: true,
                nif_cif: true,
                telefono: true,
              },
            },
            items: {
              include: {
                producto: {
                  select: {
                    slug: true,
                    imagen: true,
                    formato: true,
                    calidad: true,
                    hs_code: true,
                    cajas_palet: true,
                    peso_caja_kg: true,
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
        producto_formato: item.producto?.formato || null,
        producto_calidad: item.producto?.calidad || null,
        producto_hs_code: item.producto?.hs_code || null,
        producto_cajas_palet: item.producto?.cajas_palet || null,
        producto_peso_caja_kg: item.producto?.peso_caja_kg || null,
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
        user: {
          nombre: pedido.user.nombre,
          codigo_cliente: pedido.user.codigo_cliente,
          pais: pedido.user.pais,
          nif_cif: pedido.user.nif_cif,
          telefono: pedido.user.telefono,
        },
      },
    }

    return NextResponse.json(safeFactura)
  } catch (error) {
    console.error('Error fetching factura:', error)
    return NextResponse.json({ error: 'Error al obtener factura' }, { status: 500 })
  }
}
