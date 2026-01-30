import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener estadísticas del almacén
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Pedidos pendientes (PENDIENTE o CONFIRMADO)
    const pedidos_pendientes = await prisma.pedido.count({
      where: {
        estado: { in: ['PENDIENTE', 'CONFIRMADO'] },
      },
    })

    // Pedidos de hoy
    const pedidos_hoy = await prisma.pedido.count({
      where: {
        createdAt: { gte: startOfDay },
      },
    })

    // Facturación del mes
    const facturasDelMes = await prisma.factura.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        estado: { in: ['EMITIDA', 'PAGADA'] },
      },
      select: { total_euros: true },
    })
    const facturacion_mes = facturasDelMes.reduce((sum, f) => sum + f.total_euros, 0)

    // Facturación pendiente de cobro
    const facturasPendientes = await prisma.factura.findMany({
      where: {
        estado: { in: ['EMITIDA', 'VENCIDA'] },
      },
      select: { total_euros: true },
    })
    const facturacion_pendiente = facturasPendientes.reduce((sum, f) => sum + f.total_euros, 0)

    // Productos con bajo stock (menos de 100 m²)
    const productos_bajo_stock = await prisma.producto.count({
      where: {
        stock_m2: { lt: 100 },
      },
    })

    // Albaranes pendientes (BORRADOR o EMITIDO)
    const albaranes_pendientes = await prisma.albaran.count({
      where: {
        estado: { in: ['BORRADOR', 'EMITIDO'] },
      },
    })

    // Total productos
    const total_productos = await prisma.producto.count()

    // Total clientes
    const total_clientes = await prisma.user.count({
      where: { role: 'CLIENTE' },
    })

    return NextResponse.json({
      pedidos_pendientes,
      pedidos_hoy,
      facturacion_mes,
      facturacion_pendiente,
      productos_bajo_stock,
      albaranes_pendientes,
      total_productos,
      total_clientes,
    })
  } catch (error) {
    console.error('Error fetching estadisticas:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
