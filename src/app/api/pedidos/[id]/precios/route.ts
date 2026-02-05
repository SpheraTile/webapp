import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { precios } = body // precios: { [itemId]: nuevoPrecio }

    if (!precios || typeof precios !== 'object') {
      return NextResponse.json(
        { error: 'Datos de precios inválidos' },
        { status: 400 }
      )
    }

    // Verificar que el pedido existe y no tiene factura
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        items: true,
        factura: true,
      },
    })

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    if (pedido.factura) {
      return NextResponse.json(
        { error: 'No se pueden modificar precios de un pedido que ya tiene factura' },
        { status: 400 }
      )
    }

    // Actualizar precios de cada item
    let nuevoSubtotal = 0

    for (const item of pedido.items) {
      const nuevoPrecio = precios[item.id]
      if (nuevoPrecio !== undefined && nuevoPrecio !== item.precio_m2) {
        const nuevoSubtotalItem = item.cantidad_m2 * nuevoPrecio
        await prisma.itemPedido.update({
          where: { id: item.id },
          data: {
            precio_m2: nuevoPrecio,
            subtotal: nuevoSubtotalItem,
          },
        })
        nuevoSubtotal += nuevoSubtotalItem
      } else {
        nuevoSubtotal += item.subtotal
      }
    }

    // Recalcular totales del pedido
    const nuevoIva = nuevoSubtotal * (pedido.iva_porcentaje / 100)
    const nuevoTotal = nuevoSubtotal + nuevoIva

    await prisma.pedido.update({
      where: { id },
      data: {
        subtotal_euros: nuevoSubtotal,
        iva_euros: nuevoIva,
        total_euros: nuevoTotal,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating pedido prices:', error)
    return NextResponse.json(
      { error: 'Error al actualizar precios' },
      { status: 500 }
    )
  }
}
