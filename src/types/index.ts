// Tipos principales para el catálogo de cerámica SPHERA TILE

export type Calidad = 'COM' | 'PRIMERA'

export type MateriaPrima = 'Porcelánico' | 'Gres' | 'Azulejo'

export type Aspecto =
  | 'Blanco'
  | 'Cemento'
  | 'Colores'
  | 'Madera'
  | 'Mármol'
  | 'Piedra'
  | 'Terracota'

export type Acabado = 'Mate' | 'Pulido' | 'Satinado' | 'Texturizado' | 'Antideslizante'

// Nuevos tipos de producto
export type TipoPieza = 'base' | 'decorado' | 'multistep'
export type Uso = 'pavimento' | 'revestimiento' | 'pavimento_revestimiento'
export type EstadoProducto = 'normal' | 'oferta' | 'novedad'

export interface Producto {
  id: string
  slug: string
  nombre: string
  referencia: string
  serie: string
  imagen: string
  galeria: string[]
  formato: string
  precio_m2: number
  stock_m2: number
  calidad: Calidad
  materia_prima: MateriaPrima
  aspecto: Aspecto
  acabado: Acabado
  tipo_pieza: TipoPieza
  uso: Uso
  estado_producto: EstadoProducto
  descripcion?: string
  // Información de empaquetado
  m2_caja: number
  piezas_caja: number
  m2_palet: number
  cajas_palet: number
  peso_caja_kg: number
  pedido_minimo_m2: number
  hs_code?: string // Código arancelario (H.S. Code)
  createdAt?: Date
  updatedAt?: Date
}

export interface FiltrosProducto {
  busqueda?: string
  calidad?: Calidad[]
  materia_prima?: MateriaPrima[]
  aspecto?: Aspecto[]
  acabado?: Acabado[]
  tipo_pieza?: TipoPieza[]
  uso?: Uso[]
  estado_producto?: EstadoProducto[]
  precio_min?: number
  precio_max?: number
  solo_con_stock?: boolean
}

export interface ItemCesta {
  producto: Producto
  cantidad_m2: number
  cantidad_cajas: number
}

export interface Cesta {
  items: ItemCesta[]
  total_m2: number
  total_euros: number
}

export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  empresa?: string
  nif_cif: string
  direccion: string
  ciudad: string
  provincia: string
  codigo_postal: string
  pais: string
  notas?: string
  fecha_alta: Date
}

export interface DatosPedido {
  cliente_id: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  empresa?: string
  nif_cif?: string
  direccion_envio: string
  ciudad: string
  provincia?: string
  codigo_postal: string
  notas?: string
}

export type EstadoPedido = 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'

export interface ItemPedido {
  producto_id: string
  producto_nombre: string
  producto_referencia: string
  cantidad_m2: number
  cantidad_cajas: number
  precio_m2: number
  subtotal: number
}

export interface Pedido extends DatosPedido {
  id: string
  numero_pedido: string
  fecha: Date
  fecha_actualizacion: Date
  items: ItemPedido[]
  total_m2: number
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  estado: EstadoPedido
  albaran_id?: string
  factura_id?: string
}

// Albarán (Delivery Note)
export type EstadoAlbaran = 'borrador' | 'emitido' | 'entregado' | 'anulado'

export interface Albaran {
  id: string
  numero_albaran: string
  fecha_emision: Date
  fecha_entrega?: Date
  pedido_id: string
  cliente_id: string
  cliente_nombre: string
  direccion_entrega: string
  items: ItemPedido[]
  total_m2: number
  total_cajas: number
  peso_total_kg: number
  estado: EstadoAlbaran
  notas?: string
  transportista?: string
  matricula_vehiculo?: string
}

// Factura (Invoice)
export type EstadoFactura = 'borrador' | 'emitida' | 'pagada' | 'vencida' | 'anulada'
export type MetodoPago = 'transferencia' | 'tarjeta' | 'efectivo' | 'pagare' | 'domiciliacion'

export interface Factura {
  id: string
  numero_factura: string
  fecha_emision: Date
  fecha_vencimiento: Date
  fecha_pago?: Date
  pedido_id: string
  albaran_id?: string
  cliente_id: string
  cliente_nombre: string
  cliente_nif_cif: string
  direccion_facturacion: string
  items: ItemPedido[]
  subtotal_euros: number
  iva_porcentaje: number
  iva_euros: number
  total_euros: number
  estado: EstadoFactura
  metodo_pago: MetodoPago
  notas?: string
}

// Estadísticas del almacén
export interface EstadisticasAlmacen {
  pedidos_pendientes: number
  pedidos_hoy: number
  facturacion_mes: number
  facturacion_pendiente: number
  productos_bajo_stock: number
  albaranes_pendientes: number
}

// Opciones para los filtros (para componentes UI)
export const OPCIONES_CALIDAD: Calidad[] = ['COM', 'PRIMERA']
export const OPCIONES_MATERIA_PRIMA: MateriaPrima[] = ['Porcelánico', 'Gres', 'Azulejo']
export const OPCIONES_ASPECTO: Aspecto[] = ['Blanco', 'Cemento', 'Colores', 'Madera', 'Mármol', 'Piedra', 'Terracota']
export const OPCIONES_ACABADO: Acabado[] = ['Mate', 'Pulido', 'Satinado', 'Texturizado', 'Antideslizante']
export const OPCIONES_TIPO_PIEZA: TipoPieza[] = ['base', 'decorado', 'multistep']
export const OPCIONES_USO: Uso[] = ['pavimento', 'revestimiento', 'pavimento_revestimiento']
export const OPCIONES_ESTADO_PRODUCTO: EstadoProducto[] = ['normal', 'oferta', 'novedad']
export const OPCIONES_ESTADO_PEDIDO: EstadoPedido[] = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado']
export const OPCIONES_ESTADO_ALBARAN: EstadoAlbaran[] = ['borrador', 'emitido', 'entregado', 'anulado']
export const OPCIONES_ESTADO_FACTURA: EstadoFactura[] = ['borrador', 'emitida', 'pagada', 'vencida', 'anulada']
export const OPCIONES_METODO_PAGO: MetodoPago[] = ['transferencia', 'tarjeta', 'efectivo', 'pagare', 'domiciliacion']

// Labels para mostrar en UI
export const LABELS_TIPO_PIEZA: Record<TipoPieza, string> = {
  base: 'Base',
  decorado: 'Decorado',
  multistep: 'Multistep',
}

export const LABELS_USO: Record<Uso, string> = {
  pavimento: 'Pavimento',
  revestimiento: 'Revestimiento',
  pavimento_revestimiento: 'Pavimento y Revestimiento',
}

export const LABELS_ESTADO_PRODUCTO: Record<EstadoProducto, string> = {
  normal: 'Normal',
  oferta: 'Oferta',
  novedad: 'Novedad',
}
