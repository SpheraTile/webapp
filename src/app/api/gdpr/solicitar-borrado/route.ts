import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getDataDeletionRequestEmail } from '@/lib/email'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        nombre: true,
        email: true,
        codigo_cliente: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener email del admin
    const adminEmail = process.env.ADMIN_EMAIL || 'info@spheratile.es'

    const emailContent = getDataDeletionRequestEmail(
      user.nombre,
      user.email,
      user.codigo_cliente
    )

    await sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      message: 'Solicitud enviada correctamente. Nos pondremos en contacto contigo.',
    })
  } catch (error) {
    console.error('Error processing data deletion request:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
