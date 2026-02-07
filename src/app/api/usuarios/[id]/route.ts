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
        tipo_identificacion: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigo_postal: true,
        pais: true,
        codigo_cliente: true,
        subcuenta: true,
        moneda: true,
        forma_cobro: true,
        canal_cobro: true,
        iban: true,
        bic: true,
        referencia_mandato: true,
        idioma: true,
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
    if (data.tipo_identificacion !== undefined) updateData.tipo_identificacion = data.tipo_identificacion || null
    if (data.direccion !== undefined) updateData.direccion = data.direccion || null
    if (data.ciudad !== undefined) updateData.ciudad = data.ciudad || null
    if (data.provincia !== undefined) updateData.provincia = data.provincia || null
    if (data.codigo_postal !== undefined) updateData.codigo_postal = data.codigo_postal || null
    if (data.pais !== undefined) updateData.pais = data.pais || null
    if (data.codigo_cliente !== undefined) updateData.codigo_cliente = data.codigo_cliente || null
    if (data.subcuenta !== undefined) updateData.subcuenta = data.subcuenta || null
    if (data.moneda !== undefined) updateData.moneda = data.moneda || null
    if (data.forma_cobro !== undefined) updateData.forma_cobro = data.forma_cobro || null
    if (data.canal_cobro !== undefined) updateData.canal_cobro = data.canal_cobro || null
    if (data.iban !== undefined) updateData.iban = data.iban || null
    if (data.bic !== undefined) updateData.bic = data.bic || null
    if (data.referencia_mandato !== undefined) updateData.referencia_mandato = data.referencia_mandato || null
    if (data.idioma !== undefined) updateData.idioma = data.idioma || 'es'
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

// DELETE - Eliminar usuario permanentemente
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

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { pedidos: true } } },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // No permitir eliminar si tiene pedidos
    if (targetUser._count.pedidos > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: el usuario tiene ${targetUser._count.pedidos} pedido(s). Desactívalo en su lugar.` },
        { status: 400 }
      )
    }

    // Eliminar usuario (ResetTokens se eliminan por cascade)
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting usuario:', error)
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
