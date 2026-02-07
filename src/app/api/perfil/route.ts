import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener perfil del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        telefono: true,
        empresa: true,
        nif_cif: true,
        tipo_identificacion: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigo_postal: true,
        pais: true,
        codigo_cliente: true,
        moneda: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 })
  }
}

// PUT - Actualizar perfil del usuario actual
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Solo permitir actualizar ciertos campos
    const allowedFields = [
      'nombre',
      'telefono',
      'empresa',
      'nif_cif',
      'direccion',
      'ciudad',
      'provincia',
      'codigo_postal',
    ]

    const updateData: Record<string, string> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        telefono: true,
        empresa: true,
        nif_cif: true,
        tipo_identificacion: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigo_postal: true,
        pais: true,
        codigo_cliente: true,
        moneda: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}
