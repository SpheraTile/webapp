import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener un producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const producto = await prisma.producto.findUnique({
      where: { id },
    })

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error fetching producto:', error)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

// PUT - Actualizar producto (solo admin)
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

    // Verificar que existe
    const existing = await prisma.producto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        slug: data.slug,
        referencia: data.referencia,
        nombre: data.nombre,
        serie: data.serie,
        imagen: data.imagen,
        galeria: data.galeria,
        formato: data.formato,
        precio_m2: data.precio_m2 !== undefined ? parseFloat(data.precio_m2) : undefined,
        stock_m2: data.stock_m2 !== undefined ? parseFloat(data.stock_m2) : undefined,
        calidad: data.calidad,
        materia_prima: data.materia_prima,
        aspecto: data.aspecto,
        acabado: data.acabado,
        tipo_pieza: data.tipo_pieza,
        uso: data.uso,
        estado_producto: data.estado_producto,
        descripcion: data.descripcion,
        m2_caja: data.m2_caja !== undefined ? parseFloat(data.m2_caja) : undefined,
        piezas_caja: data.piezas_caja !== undefined ? parseInt(data.piezas_caja) : undefined,
        m2_palet: data.m2_palet !== undefined ? parseFloat(data.m2_palet) : undefined,
        cajas_palet: data.cajas_palet !== undefined ? parseInt(data.cajas_palet) : undefined,
        peso_caja_kg: data.peso_caja_kg !== undefined ? parseFloat(data.peso_caja_kg) : undefined,
        pedido_minimo_m2: data.pedido_minimo_m2 !== undefined ? parseFloat(data.pedido_minimo_m2) : undefined,
        hs_code: data.hs_code !== undefined ? (data.hs_code || null) : undefined,
      },
    })

    return NextResponse.json(producto)
  } catch (error) {
    console.error('Error updating producto:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un producto con esa referencia o slug' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// DELETE - Eliminar producto (solo admin)
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

    // Verificar que existe
    const existing = await prisma.producto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Verificar si tiene pedidos asociados
    const lineasPedido = await prisma.itemPedido.count({
      where: { productoId: id }
    })

    if (lineasPedido > 0) {
      return NextResponse.json({
        error: `No se puede eliminar: el producto tiene ${lineasPedido} pedido(s) asociado(s)`
      }, { status: 400 })
    }

    await prisma.producto.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting producto:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
