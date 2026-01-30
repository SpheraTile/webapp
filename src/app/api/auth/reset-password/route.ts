import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar token válido
    const resetToken = await prisma.resetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Este enlace ya ha sido utilizado' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'El enlace ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Actualizar contraseña y marcar token como usado
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.resetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
    })
  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    )
  }
}
