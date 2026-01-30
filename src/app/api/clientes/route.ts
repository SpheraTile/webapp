import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Listar clientes (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busqueda = searchParams.get('busqueda')

    const where: any = {
      role: 'CLIENTE',
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
        { empresa: { contains: busqueda, mode: 'insensitive' } },
      ]
    }

    const clientes = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        empresa: true,
        nif_cif: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigo_postal: true,
        createdAt: true,
        _count: {
          select: { pedidos: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ clientes })
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

// POST - Crear cliente (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Hash password
    const hashedPassword = bcrypt.hashSync(data.password || 'cliente123', 10)

    const cliente = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        nombre: data.nombre,
        role: 'CLIENTE',
        telefono: data.telefono,
        empresa: data.empresa,
        nif_cif: data.nif_cif,
        direccion: data.direccion,
        ciudad: data.ciudad,
        provincia: data.provincia,
        codigo_postal: data.codigo_postal,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Error creating cliente:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un cliente con ese email' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}
