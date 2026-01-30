import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que es admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        telefono: true,
        empresa: true,
        nif_cif: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigo_postal: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        pedidos: {
          select: {
            id: true,
            numero_pedido: true,
            total_euros: true,
            estado: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { pedidos: true },
        },
      },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error fetching usuario:', error)
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que es admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const data = await request.json()

    // No permitir cambiar el email del admin principal
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (data.nombre) updateData.nombre = data.nombre
    if (data.telefono !== undefined) updateData.telefono = data.telefono || null
    if (data.empresa !== undefined) updateData.empresa = data.empresa || null
    if (data.nif_cif !== undefined) updateData.nif_cif = data.nif_cif || null
    if (data.direccion !== undefined) updateData.direccion = data.direccion || null
    if (data.ciudad !== undefined) updateData.ciudad = data.ciudad || null
    if (data.provincia !== undefined) updateData.provincia = data.provincia || null
    if (data.codigo_postal !== undefined) updateData.codigo_postal = data.codigo_postal || null
    if (data.role) updateData.role = data.role
    if (data.activo !== undefined) updateData.activo = data.activo

    // Si se proporciona nueva contraseña, hashearla
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const usuario = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        telefono: true,
        empresa: true,
        activo: true,
      },
    })

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error updating usuario:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// DELETE - Eliminar usuario (desactivar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que es admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // No permitir eliminar el propio usuario
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propio usuario' },
        { status: 400 }
      )
    }

    // En lugar de eliminar, desactivamos el usuario
    await prisma.user.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: 'Usuario desactivado correctamente' })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
