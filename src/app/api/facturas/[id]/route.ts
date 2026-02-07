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
        items: true,
        pedido: {
          include: {
            user: true,
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

    // Si la factura no tiene items propios, crear items temporales desde el pedido
    if (factura && (!factura.items || factura.items.length === 0)) {
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

    // Si se actualizan items, recalcular totales
    if (data.items && Array.isArray(data.items)) {
      // Verificar si la factura tiene items propios
      const existingItems = await prisma.itemFactura.findMany({
        where: { facturaId: id },
      })

      if (existingItems.length === 0) {
        // Crear items desde el pedido con los precios actualizados
        const facturaConPedido = await prisma.factura.findUnique({
          where: { id },
          include: {
            pedido: {
              include: {
                items: {
                  include: {
                    producto: {
                      select: { slug: true, imagen: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (facturaConPedido) {
          for (const pedidoItem of facturaConPedido.pedido.items) {
            const itemData = data.items.find((i: any) => i.id === pedidoItem.id)
            const precio_m2 = itemData?.precio_m2 ?? pedidoItem.precio_m2
            await prisma.itemFactura.create({
              data: {
                facturaId: id,
                productoId: pedidoItem.productoId,
                producto_nombre: pedidoItem.producto_nombre,
                producto_referencia: pedidoItem.producto_referencia,
                producto_slug: pedidoItem.producto?.slug || null,
                producto_imagen: pedidoItem.producto?.imagen || null,
                cantidad_m2: pedidoItem.cantidad_m2,
                cantidad_cajas: pedidoItem.cantidad_cajas,
                precio_m2: precio_m2,
                subtotal: pedidoItem.cantidad_m2 * precio_m2,
              },
            })
          }
        }
      } else {
        // Actualizar cada item existente
        for (const item of data.items) {
          await prisma.itemFactura.update({
            where: { id: item.id },
            data: {
              precio_m2: item.precio_m2,
              subtotal: item.cantidad_m2 * item.precio_m2,
            },
          })
        }
      }

      // Recalcular totales de la factura
      const itemsActualizados = await prisma.itemFactura.findMany({
        where: { facturaId: id },
      })

      const subtotal_euros = itemsActualizados.reduce((sum: number, item: any) => sum + item.subtotal, 0)
      const iva_euros = subtotal_euros * (factura.iva_porcentaje / 100)
      const total_euros = subtotal_euros + iva_euros

      await prisma.factura.update({
        where: { id },
        data: {
          subtotal_euros,
          iva_euros,
          total_euros,
        },
      })
    }

    const updatedFactura = await prisma.factura.update({
      where: { id },
      data: {
        estado: data.estado,
        metodo_pago: data.metodo_pago,
        notas: data.notas,
        fecha_pago: data.estado === 'PAGADA' ? new Date() : data.fecha_pago,
      },
      include: {
        items: true,
        pedido: {
          include: {
            user: true,
          },
        },
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
