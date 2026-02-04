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
      include: {
        factura: true,
        user: true,
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
    })

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    if (pedido.factura) {
      return NextResponse.json({ error: 'Este pedido ya tiene una factura' }, { status: 400 })
    }

    // Generar número de factura basado en el último número existente
    const currentYear = new Date().getFullYear()
    const lastFactura = await prisma.factura.findFirst({
      where: {
        numero_factura: {
          startsWith: `FAC-${currentYear}-`
        }
      },
      orderBy: { numero_factura: 'desc' },
      select: { numero_factura: true }
    })

    let nextNumber = 1
    if (lastFactura?.numero_factura) {
      const match = lastFactura.numero_factura.match(/FAC-\d{4}-(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }
    const numero_factura = `FAC-${currentYear}-${String(nextNumber).padStart(5, '0')}`

    // Fecha de vencimiento (30 días por defecto)
    const fecha_vencimiento = new Date()
    fecha_vencimiento.setDate(fecha_vencimiento.getDate() + 30)

    // Preparar items de factura desde los items del pedido
    const itemsFactura = pedido.items.map((item) => ({
      productoId: item.productoId,
      producto_nombre: item.producto_nombre,
      producto_referencia: item.producto_referencia,
      producto_slug: item.producto?.slug || null,
      producto_imagen: item.producto?.imagen || null,
      cantidad_m2: item.cantidad_m2,
      cantidad_cajas: item.cantidad_cajas,
      precio_m2: item.precio_m2,
      subtotal: item.subtotal,
    }))

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
        items: {
          create: itemsFactura,
        },
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

    return NextResponse.json(factura, { status: 201 })
  } catch (error) {
    console.error('Error creating factura:', error)
    return NextResponse.json({ error: 'Error al crear factura' }, { status: 500 })
  }
}
