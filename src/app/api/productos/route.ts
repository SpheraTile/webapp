import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET - Listar productos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filtros
    const busqueda = searchParams.get('busqueda')
    const calidad = searchParams.getAll('calidad')
    const materia_prima = searchParams.getAll('materia_prima')
    const aspecto = searchParams.getAll('aspecto')
    const acabado = searchParams.getAll('acabado')
    const tipo_pieza = searchParams.getAll('tipo_pieza')
    const uso = searchParams.getAll('uso')
    const estado_producto = searchParams.getAll('estado_producto')
    const precio_min = searchParams.get('precio_min')
    const precio_max = searchParams.get('precio_max')
    const solo_con_stock = searchParams.get('solo_con_stock')

    // Paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Construir where clause
    const where: Prisma.ProductoWhereInput = {}

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { referencia: { contains: busqueda, mode: 'insensitive' } },
        { serie: { contains: busqueda, mode: 'insensitive' } },
      ]
    }

    if (calidad.length > 0) {
      where.calidad = { in: calidad as any[] }
    }

    if (materia_prima.length > 0) {
      where.materia_prima = { in: materia_prima as any[] }
    }

    if (aspecto.length > 0) {
      where.aspecto = { in: aspecto as any[] }
    }

    if (acabado.length > 0) {
      where.acabado = { in: acabado as any[] }
    }

    if (tipo_pieza.length > 0) {
      where.tipo_pieza = { in: tipo_pieza as any[] }
    }

    if (uso.length > 0) {
      where.uso = { in: uso as any[] }
    }

    if (estado_producto.length > 0) {
      where.estado_producto = { in: estado_producto as any[] }
    }

    if (precio_min) {
      where.precio_m2 = { ...where.precio_m2 as any, gte: parseFloat(precio_min) }
    }

    if (precio_max) {
      where.precio_m2 = { ...where.precio_m2 as any, lte: parseFloat(precio_max) }
    }

    if (solo_con_stock === 'true') {
      where.stock_m2 = { gt: 0 }
    }

    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.producto.count({ where }),
    ])

    return NextResponse.json({
      productos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching productos:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

// POST - Crear producto (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    // Generar slug si no existe
    if (!data.slug) {
      data.slug = data.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    const producto = await prisma.producto.create({
      data: {
        slug: data.slug,
        referencia: data.referencia,
        nombre: data.nombre,
        serie: data.serie,
        imagen: data.imagen,
        galeria: data.galeria || [],
        formato: data.formato,
        precio_m2: parseFloat(data.precio_m2),
        stock_m2: parseFloat(data.stock_m2),
        calidad: data.calidad,
        materia_prima: data.materia_prima,
        aspecto: data.aspecto,
        acabado: data.acabado,
        tipo_pieza: data.tipo_pieza || 'BASE',
        uso: data.uso || 'PAVIMENTO',
        estado_producto: data.estado_producto || 'NORMAL',
        descripcion: data.descripcion,
        m2_caja: parseFloat(data.m2_caja),
        piezas_caja: parseInt(data.piezas_caja),
        m2_palet: parseFloat(data.m2_palet),
        cajas_palet: parseInt(data.cajas_palet),
        peso_caja_kg: parseFloat(data.peso_caja_kg),
        pedido_minimo_m2: parseFloat(data.pedido_minimo_m2),
      },
    })

    return NextResponse.json(producto, { status: 201 })
  } catch (error) {
    console.error('Error creating producto:', error)
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un producto con esa referencia o slug' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
