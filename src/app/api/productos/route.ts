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
    const formato = searchParams.getAll('formato')
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
    const serie = searchParams.get('serie')

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

    if (serie) {
      where.serie = serie
    }

    if (formato.length > 0) {
      where.formato = { in: formato }
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

    // Get products and total count
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.producto.count({ where }),
    ])

    // Calculate facets (counts for each filter option)
    // We need to count products for each filter value, considering OTHER active filters
    const calculateFacets = async () => {
      // Build base where without each specific filter to get counts
      const baseWhere: Prisma.ProductoWhereInput = {}

      if (busqueda) {
        baseWhere.OR = [
          { nombre: { contains: busqueda, mode: 'insensitive' } },
          { referencia: { contains: busqueda, mode: 'insensitive' } },
          { serie: { contains: busqueda, mode: 'insensitive' } },
        ]
      }

      if (precio_min) {
        baseWhere.precio_m2 = { ...baseWhere.precio_m2 as any, gte: parseFloat(precio_min) }
      }
      if (precio_max) {
        baseWhere.precio_m2 = { ...baseWhere.precio_m2 as any, lte: parseFloat(precio_max) }
      }
      if (solo_con_stock === 'true') {
        baseWhere.stock_m2 = { gt: 0 }
      }

      // Helper to build where with all filters except one
      const buildWhereExcept = (exclude: string): Prisma.ProductoWhereInput => {
        const w: Prisma.ProductoWhereInput = { ...baseWhere }
        if (exclude !== 'formato' && formato.length > 0) w.formato = { in: formato }
        if (exclude !== 'calidad' && calidad.length > 0) w.calidad = { in: calidad as any[] }
        if (exclude !== 'materia_prima' && materia_prima.length > 0) w.materia_prima = { in: materia_prima as any[] }
        if (exclude !== 'aspecto' && aspecto.length > 0) w.aspecto = { in: aspecto as any[] }
        if (exclude !== 'acabado' && acabado.length > 0) w.acabado = { in: acabado as any[] }
        if (exclude !== 'tipo_pieza' && tipo_pieza.length > 0) w.tipo_pieza = { in: tipo_pieza as any[] }
        if (exclude !== 'uso' && uso.length > 0) w.uso = { in: uso as any[] }
        if (exclude !== 'estado_producto' && estado_producto.length > 0) w.estado_producto = { in: estado_producto as any[] }
        return w
      }

      // Get counts for each facet category
      const [
        formatoCounts,
        calidadCounts,
        materiaPrimaCounts,
        aspectoCounts,
        acabadoCounts,
        tipoPiezaCounts,
        usoCounts,
        estadoProductoCounts,
      ] = await Promise.all([
        prisma.producto.groupBy({
          by: ['formato'],
          where: buildWhereExcept('formato'),
          _count: { formato: true },
        }),
        prisma.producto.groupBy({
          by: ['calidad'],
          where: buildWhereExcept('calidad'),
          _count: { calidad: true },
        }),
        prisma.producto.groupBy({
          by: ['materia_prima'],
          where: buildWhereExcept('materia_prima'),
          _count: { materia_prima: true },
        }),
        prisma.producto.groupBy({
          by: ['aspecto'],
          where: buildWhereExcept('aspecto'),
          _count: { aspecto: true },
        }),
        prisma.producto.groupBy({
          by: ['acabado'],
          where: buildWhereExcept('acabado'),
          _count: { acabado: true },
        }),
        prisma.producto.groupBy({
          by: ['tipo_pieza'],
          where: buildWhereExcept('tipo_pieza'),
          _count: { tipo_pieza: true },
        }),
        prisma.producto.groupBy({
          by: ['uso'],
          where: buildWhereExcept('uso'),
          _count: { uso: true },
        }),
        prisma.producto.groupBy({
          by: ['estado_producto'],
          where: buildWhereExcept('estado_producto'),
          _count: { estado_producto: true },
        }),
      ])

      return {
        formato: Object.fromEntries(formatoCounts.map(c => [c.formato, c._count.formato])),
        calidad: Object.fromEntries(calidadCounts.map(c => [c.calidad, c._count.calidad])),
        materia_prima: Object.fromEntries(materiaPrimaCounts.map(c => [c.materia_prima, c._count.materia_prima])),
        aspecto: Object.fromEntries(aspectoCounts.map(c => [c.aspecto, c._count.aspecto])),
        acabado: Object.fromEntries(acabadoCounts.map(c => [c.acabado, c._count.acabado])),
        tipo_pieza: Object.fromEntries(tipoPiezaCounts.map(c => [c.tipo_pieza, c._count.tipo_pieza])),
        uso: Object.fromEntries(usoCounts.map(c => [c.uso, c._count.uso])),
        estado_producto: Object.fromEntries(estadoProductoCounts.map(c => [c.estado_producto, c._count.estado_producto])),
      }
    }

    const facets = await calculateFacets()

    return NextResponse.json({
      productos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      facets,
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
        almacen: data.almacen || 'PRINCIPAL',
        mostrar_en_grid: data.mostrar_en_grid ?? true,
        mostrar_en_catalogo: data.mostrar_en_catalogo ?? true,
        descripcion: data.descripcion,
        m2_caja: parseFloat(data.m2_caja),
        piezas_caja: parseInt(data.piezas_caja),
        m2_palet: parseFloat(data.m2_palet),
        cajas_palet: parseInt(data.cajas_palet),
        peso_caja_kg: parseFloat(data.peso_caja_kg),
        pedido_minimo_m2: parseFloat(data.pedido_minimo_m2),
        hs_code: data.hs_code || null,
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
