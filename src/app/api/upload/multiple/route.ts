import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToBunny } from '@/lib/bunny'

// POST - Subir múltiples imágenes a Bunny CDN
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (solo admin puede subir)
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'productos'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron archivos' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024

    const results: { url: string; name: string }[] = []
    const errors: { name: string; error: string }[] = []

    for (const file of files) {
      // Validar tipo
      if (!allowedTypes.includes(file.type)) {
        errors.push({ name: file.name, error: 'Tipo no permitido' })
        continue
      }

      // Validar tamaño
      if (file.size > maxSize) {
        errors.push({ name: file.name, error: 'Archivo muy grande' })
        continue
      }

      // Convertir y subir
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const result = await uploadToBunny(buffer, file.name, folder)

      if (result.success && result.url) {
        results.push({ url: result.url, name: file.name })
      } else {
        errors.push({ name: file.name, error: result.error || 'Error desconocido' })
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `${results.length} imagen(es) subida(s)`,
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Error al subir archivos' }, { status: 500 })
  }
}
