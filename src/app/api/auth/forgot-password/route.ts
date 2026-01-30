import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 })
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Siempre responder igual para no revelar si el email existe
    if (!user) {
      return NextResponse.json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      })
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
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Enviar email
    const emailContent = getPasswordResetEmail(user.nombre, resetUrl)
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
    })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
