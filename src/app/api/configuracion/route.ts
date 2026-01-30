import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuraciones (público para las necesarias en frontend)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clave = searchParams.get('clave')

    if (clave) {
      // Obtener una configuración específica
      const config = await prisma.configuracionSitio.findUnique({
        where: { clave },
      })
      return NextResponse.json(config || { clave, valor: null })
    }

    // Obtener todas las configuraciones
    const configs = await prisma.configuracionSitio.findMany()
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching configuracion:', error)
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

// POST - Crear o actualizar configuración (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { clave, valor, tipo, descripcion } = await request.json()

    if (!clave || valor === undefined) {
      return NextResponse.json({ error: 'Clave y valor son requeridos' }, { status: 400 })
    }

    // Upsert (crear o actualizar)
    const config = await prisma.configuracionSitio.upsert({
      where: { clave },
      update: {
        valor,
        tipo: tipo || 'text',
        descripcion,
      },
      create: {
        clave,
        valor,
        tipo: tipo || 'text',
        descripcion,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error saving configuracion:', error)
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 })
  }
}

// DELETE - Eliminar configuración (solo admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clave = searchParams.get('clave')

    if (!clave) {
      return NextResponse.json({ error: 'Clave es requerida' }, { status: 400 })
    }

    await prisma.configuracionSitio.delete({
      where: { clave },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting configuracion:', error)
    return NextResponse.json({ error: 'Error al eliminar configuración' }, { status: 500 })
  }
}
