import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getWelcomeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

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

    // Generar una nueva contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Actualizar contraseña del usuario
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    // Enviar email con credenciales
    const loginUrl = 'https://app.spheratile.es/login'
    const emailContent = getWelcomeEmail(
      user.nombre,
      loginUrl,
      user.idioma || 'es',
      { email: user.email, password: tempPassword }
    )

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    console.log('✅ Welcome email sent to:', user.email)

    return NextResponse.json({ message: 'Email enviado correctamente' })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}
