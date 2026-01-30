import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToBunny } from '@/lib/bunny'

// POST - Subir video a Bunny CDN
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (solo admin puede subir)
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'portada'

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Validar tipo de archivo (videos e imágenes)
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Use MP4, WebM, OGG, JPG, PNG, WebP o GIF.' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 100MB para videos)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 100MB.' },
        { status: 400 }
      )
    }

    // Convertir a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Bunny CDN
    const result = await uploadToBunny(buffer, file.name, folder)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Determinar si es video o imagen
    const isVideo = file.type.startsWith('video/')

    return NextResponse.json({
      success: true,
      url: result.url,
      type: isVideo ? 'video' : 'image',
      message: isVideo ? 'Video subido correctamente' : 'Imagen subida correctamente',
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
