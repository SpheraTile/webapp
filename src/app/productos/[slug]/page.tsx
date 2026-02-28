import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDetailClient } from '@/components/producto/ProductDetailClient'
import { Producto } from '@/types'

interface ProductoPageProps {
  params: Promise<{ slug: string }>
}

// Mapeo de valores de BD a valores frontend
const mapFromDBValue = (key: string, value: string): string => {
  const maps: Record<string, Record<string, string>> = {
    materia_prima: {
      'PORCELANICO': 'Porcelánico',
      'GRES': 'Gres',
      'AZULEJO': 'Azulejo',
    },
    aspecto: {
      'BLANCO': 'Blanco',
      'CEMENTO': 'Cemento',
      'COLORES': 'Colores',
      'MADERA': 'Madera',
      'MARMOL': 'Mármol',
      'PIEDRA': 'Piedra',
      'TERRACOTA': 'Terracota',
    },
    acabado: {
      'MATE': 'Mate',
      'PULIDO': 'Pulido',
      'SATINADO': 'Satinado',
      'TEXTURIZADO': 'Texturizado',
    },
    tipo_pieza: {
      'BASE': 'base',
      'DECORADO': 'decorado',
      'MULTISTEP': 'multistep',
    },
    uso: {
      'PAVIMENTO': 'pavimento',
      'REVESTIMIENTO': 'revestimiento',
      'PAVIMENTO_REVESTIMIENTO': 'pavimento_revestimiento',
    },
    estado_producto: {
      'NORMAL': 'normal',
      'OFERTA': 'oferta',
      'NOVEDAD': 'novedad',
    },
  }
  return maps[key]?.[value] || value
}

// Convertir producto de BD a tipo frontend
function mapProductoFromDB(dbProducto: any): Producto {
  return {
    id: dbProducto.id,
    slug: dbProducto.slug,
    nombre: dbProducto.nombre,
    referencia: dbProducto.referencia,
    serie: dbProducto.serie,
    imagen: dbProducto.imagen,
    galeria: dbProducto.galeria || [],
    formato: dbProducto.formato,
    precio_m2: dbProducto.precio_m2,
    stock_m2: dbProducto.stock_m2,
    calidad: dbProducto.calidad,
    materia_prima: mapFromDBValue('materia_prima', dbProducto.materia_prima) as any,
    aspecto: mapFromDBValue('aspecto', dbProducto.aspecto) as any,
    acabado: mapFromDBValue('acabado', dbProducto.acabado) as any,
    tipo_pieza: mapFromDBValue('tipo_pieza', dbProducto.tipo_pieza) as any,
    uso: mapFromDBValue('uso', dbProducto.uso) as any,
    estado_producto: mapFromDBValue('estado_producto', dbProducto.estado_producto) as any,
    almacen: dbProducto.almacen || 'PRINCIPAL',
    mostrar_en_grid: dbProducto.mostrar_en_grid ?? true,
    mostrar_en_catalogo: dbProducto.mostrar_en_catalogo ?? true,
    descripcion: dbProducto.descripcion,
    m2_caja: dbProducto.m2_caja,
    piezas_caja: dbProducto.piezas_caja,
    m2_palet: dbProducto.m2_palet,
    cajas_palet: dbProducto.cajas_palet,
    peso_caja_kg: dbProducto.peso_caja_kg,
    pedido_minimo_m2: dbProducto.pedido_minimo_m2,
    hs_code: dbProducto.hs_code,
    createdAt: dbProducto.createdAt,
    updatedAt: dbProducto.updatedAt,
  }
}

// Generar rutas estáticas para todos los productos
export async function generateStaticParams() {
  // Durante el build en Vercel, DATABASE_URL puede no estar disponible
  // Retornamos array vacío para que las páginas se generen bajo demanda
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    const productos = await prisma.producto.findMany({
      select: { slug: true },
    })
    return productos.map((producto) => ({
      slug: producto.slug,
    }))
  } catch {
    return []
  }
}

// Metadata dinámica
export async function generateMetadata({ params }: ProductoPageProps) {
  const { slug } = await params
  const producto = await prisma.producto.findUnique({
    where: { slug },
  })

  if (!producto) {
    return {
      title: 'Producto no encontrado - SPHERA TILE',
    }
  }

  return {
    title: `${producto.nombre} - SPHERA TILE`,
    description: `${producto.nombre} | Formato ${producto.formato} | ${producto.precio_m2.toFixed(2)}€/m² | ${producto.materia_prima} ${producto.acabado}`,
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { slug } = await params
  const dbProducto = await prisma.producto.findUnique({
    where: { slug },
  })

  if (!dbProducto) {
    return notFound()
  }

  const producto = mapProductoFromDB(dbProducto)

  return <ProductDetailClient producto={producto} />
}
