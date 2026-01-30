import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener facturas del usuario actual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const facturas = await prisma.factura.findMany({
      where: {
        pedido: {
          userId: session.user.id,
        },
      },
      include: {
        pedido: {
          select: {
            numero_pedido: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ facturas })
  } catch (error) {
    console.error('Error fetching mis facturas:', error)
    return NextResponse.json({ error: 'Error al obtener facturas' }, { status: 500 })
  }
}
