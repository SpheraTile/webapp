import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva son requeridas' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 400 }
      )
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    )
  }
}
