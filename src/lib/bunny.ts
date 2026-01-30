// Bunny CDN Storage Integration

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!
const STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD!
const CDN_URL = process.env.BUNNY_CDN_URL!

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Sube un archivo a Bunny CDN Storage
 * @param file - Buffer del archivo
 * @param fileName - Nombre del archivo (incluyendo extensión)
 * @param folder - Carpeta opcional (ej: "productos", "galeria")
 */
export async function uploadToBunny(
  file: Buffer,
  fileName: string,
  folder: string = 'productos'
): Promise<UploadResult> {
  try {
    // Generar nombre único para evitar colisiones
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const path = `${folder}/${uniqueFileName}`

    const response = await fetch(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${path}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': STORAGE_PASSWORD,
          'Content-Type': 'application/octet-stream',
        },
        body: new Uint8Array(file),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Bunny upload error:', errorText)
      return {
        success: false,
        error: `Error al subir archivo: ${response.status}`,
      }
    }

    // La URL pública del archivo
    const publicUrl = `${CDN_URL}/${path}`

    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error('Bunny upload exception:', error)
    return {
      success: false,
      error: 'Error de conexión con Bunny CDN',
    }
  }
}

/**
 * Elimina un archivo de Bunny CDN Storage
 * @param fileUrl - URL completa del archivo
 */
export async function deleteFromBunny(fileUrl: string): Promise<boolean> {
  try {
    // Extraer el path de la URL
    const path = fileUrl.replace(`${CDN_URL}/`, '')

    const response = await fetch(
      `https://storage.bunnycdn.com/${STORAGE_ZONE}/${path}`,
      {
        method: 'DELETE',
        headers: {
          'AccessKey': STORAGE_PASSWORD,
        },
      }
    )

    return response.ok
  } catch (error) {
    console.error('Bunny delete exception:', error)
    return false
  }
}

/**
 * Valida que el archivo sea una imagen válida
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Use JPG, PNG, WebP o GIF.',
    }
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`,
    }
  }

  return { valid: true }
}
