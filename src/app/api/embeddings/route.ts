import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateAllProductEmbeddings, updateProductEmbedding } from '@/lib/embeddings'
import { prisma } from '@/lib/prisma'

// POST - Update embeddings (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { productId } = await request.json().catch(() => ({}))

    if (productId) {
      // Update single product
      const producto = await prisma.producto.findUnique({
        where: { id: productId },
      })

      if (!producto) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }

      await updateProductEmbedding(productId, producto)
      return NextResponse.json({ message: 'Embedding actualizado', productId })
    }

    // Update all products
    const result = await updateAllProductEmbeddings()
    return NextResponse.json({
      message: 'Embeddings actualizados',
      ...result,
    })
  } catch (error) {
    console.error('Error updating embeddings:', error)
    return NextResponse.json({ error: 'Error al actualizar embeddings' }, { status: 500 })
  }
}

// GET - Check embedding status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const totalProducts = await prisma.producto.count()

    // We can't check embedding column directly with Prisma, so we return total
    return NextResponse.json({
      total_productos: totalProducts,
      mensaje: 'Usa POST para actualizar los embeddings de todos los productos',
    })
  } catch (error) {
    console.error('Error checking embeddings:', error)
    return NextResponse.json({ error: 'Error al verificar embeddings' }, { status: 500 })
  }
}
