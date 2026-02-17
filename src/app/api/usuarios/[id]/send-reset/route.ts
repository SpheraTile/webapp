import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Invalidar tokens anteriores del usuario
    await prisma.resetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    // Crear nuevo token
    await prisma.resetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Generar URL de reset
    const resetUrl = `https://app.spheratile.es/reset-password?token=${token}`

    // Enviar email
    const emailContent = getPasswordResetEmail(user.nombre, resetUrl)
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    console.log('✅ Password reset email sent to:', user.email)

    return NextResponse.json({ message: 'Email enviado correctamente' })
  } catch (error) {
    console.error('Error sending password reset:', error)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}
