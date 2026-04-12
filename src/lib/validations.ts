import { z } from 'zod'

// Usuario validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La nueva contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La nueva contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La nueva contraseña debe contener al menos un número'),
})

// Producto validation schemas
export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  referencia: z.string().min(2, 'La referencia es requerida'),
  serie: z.string().min(1, 'La serie es requerida'),
  formato: z.string().min(1, 'El formato es requerido'),
  precio_m2: z.number().positive('El precio debe ser positivo'),
  stock_m2: z.number().nonnegative('El stock no puede ser negativo'),
  calidad: z.enum(['PRIMERA', 'SEGUNDA', 'COM', 'PROMOCIONAL']),
  materia_prima: z.enum(['PORCELANICO', 'GRES', 'AZULEJO']),
  aspecto: z.enum(['BLANCO', 'CEMENTO', 'COLORES', 'MADERA', 'MARMOL', 'ONYX', 'PIEDRA', 'TERRACOTA']),
  acabado: z.enum(['MATE', 'PULIDO', 'SATINADO', 'TEXTURIZADO', 'ANTIDESLIZANTE']),
})

// Cesta/Pedido validation schemas
export const addItemSchema = z.object({
  productoId: z.string().min(1, 'ID de producto inválido'),
  cantidad: z.number().int().positive('La cantidad debe ser positiva'),
})

export const updateItemSchema = z.object({
  cantidad: z.number().int().positive('La cantidad debe ser positiva'),
})

// Search and filter validation
export const searchSchema = z.object({
  busqueda: z.string().max(200, 'La búsqueda es demasiado larga').optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

// File upload validation
export const uploadSchema = z.object({
  folder: z.enum(['productos', 'galeria', 'documentos', 'avatars']),
})

// Helper function to validate request body
export async function validateBody<T>(schema: z.ZodSchema<T>, body: any): Promise<T> {
  try {
    return await schema.parseAsync(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      throw new Error(firstError.message)
    }
    throw error
  }
}
