import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendEmail, getWelcomeEmail } from '@/lib/email'

// GET - Obtener todos los usuarios (solo admin)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: any = {}

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { empresa: { contains: search, mode: 'insensitive' } },
        { codigo_cliente: { contains: search, mode: 'insensitive' } },
      ]
    }

    const usuarios = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        telefono: true,
        empresa: true,
        nif_cif: true,
        codigo_cliente: true,
        pais: true,
        idioma: true,
        activo: true,
        createdAt: true,
        _count: {
          select: { pedidos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Error fetching usuarios:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// POST - Crear nuevo usuario (solo admin)
export async function POST(request: NextRequest) {
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

    const data = await request.json()

    // Validar datos requeridos
    if (!data.email || !data.nombre || !data.password) {
      return NextResponse.json(
        { error: 'Email, nombre y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Crear usuario
    const usuario = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        nombre: data.nombre,
        role: data.role || 'CLIENTE',
        telefono: data.telefono || null,
        empresa: data.empresa || null,
        nif_cif: data.nif_cif || null,
        tipo_identificacion: data.tipo_identificacion || null,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        provincia: data.provincia || null,
        codigo_postal: data.codigo_postal || null,
        pais: data.pais || null,
        codigo_cliente: data.codigo_cliente || null,
        subcuenta: data.subcuenta || null,
        moneda: data.moneda || 'EUR',
        forma_cobro: data.forma_cobro || null,
        canal_cobro: data.canal_cobro || null,
        iban: data.iban || null,
        bic: data.bic || null,
        referencia_mandato: data.referencia_mandato || null,
        idioma: data.idioma || 'es',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        codigo_cliente: true,
      },
    })

    // Enviar email de bienvenida si se solicita
    if (data.sendWelcomeEmail) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const emailContent = getWelcomeEmail(usuario.nombre, `${baseUrl}/login`, data.idioma || 'es')
        await sendEmail({
          to: usuario.email,
          subject: emailContent.subject,
          html: emailContent.html,
        })
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
        // No fallar la creación si el email falla
      }
    }

    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    console.error('Error creating usuario:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
