import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Emails de clientes de prueba del seed (NO incluye admin)
const SEED_CLIENT_EMAILS = [
  'construcciones.martinez@email.com',
  'reformas.lopez@email.com',
  'ceramicas.garcia@email.com',
  'decoracion.alba@email.com',
  'pedro.constructor@email.com',
]

// Slugs de productos del seed
const SEED_PRODUCT_SLUGS = [
  'marmo-bianco-60x120',
  'marmo-grigio-60x120',
  'marmo-nero-60x120',
  'forest-roble-20x120',
  'forest-nogal-20x120',
  'forest-fresno-20x120',
  'cement-grey-60x60',
  'cement-anthracite-60x60',
  'cement-white-60x60',
  'stone-beige-40x80',
  'stone-grey-40x80',
  'terra-cotto-30x30',
  'basic-blanco-brillo-20x60',
  'basic-blanco-mate-20x60',
  'decor-geometrico-20x60',
  'decor-floral-20x60',
  'step-forest-roble-20x120',
  'marmo-calacatta-60x120',
]

async function cleanup() {
  console.log('🧹 Limpiando datos de prueba del seed...')
  console.log('')

  // 1. Obtener IDs de usuarios de prueba
  const seedUsers = await prisma.user.findMany({
    where: { email: { in: SEED_CLIENT_EMAILS } },
    select: { id: true, email: true }
  })
  console.log(`👥 Usuarios de prueba encontrados: ${seedUsers.length}`)

  // 2. Obtener IDs de productos de prueba
  const seedProducts = await prisma.producto.findMany({
    where: { slug: { in: SEED_PRODUCT_SLUGS } },
    select: { id: true, nombre: true, slug: true }
  })
  console.log(`📦 Productos de prueba encontrados: ${seedProducts.length}`)

  const seedUserIds = seedUsers.map(u => u.id)
  const seedProductIds = seedProducts.map(p => p.id)

  // 3. Contar pedidos de los usuarios de prueba
  const pedidosCount = await prisma.pedido.count({
    where: { userId: { in: seedUserIds } }
  })
  console.log(`📋 Pedidos de usuarios de prueba: ${pedidosCount}`)

  // 4. Contar items con productos de prueba
  const itemsConProductosSeed = await prisma.itemPedido.count({
    where: { productoId: { in: seedProductIds } }
  })
  console.log(`📝 Items con productos de prueba: ${itemsConProductosSeed}`)

  console.log('')
  console.log('⚠️  Iniciando eliminación...')
  console.log('')

  // Eliminar en orden correcto por las relaciones

  // 5. Eliminar items de pedidos de usuarios de prueba
  const deletedItems = await prisma.itemPedido.deleteMany({
    where: { pedido: { userId: { in: seedUserIds } } }
  })
  console.log(`   ✅ Items de pedidos eliminados: ${deletedItems.count}`)

  // 6. Eliminar facturas de pedidos de usuarios de prueba
  const deletedFacturas = await prisma.factura.deleteMany({
    where: { pedido: { userId: { in: seedUserIds } } }
  })
  console.log(`   ✅ Facturas eliminadas: ${deletedFacturas.count}`)

  // 7. Eliminar albaranes de pedidos de usuarios de prueba
  const deletedAlbaranes = await prisma.albaran.deleteMany({
    where: { pedido: { userId: { in: seedUserIds } } }
  })
  console.log(`   ✅ Albaranes eliminados: ${deletedAlbaranes.count}`)

  // 8. Eliminar pedidos de usuarios de prueba
  const deletedPedidos = await prisma.pedido.deleteMany({
    where: { userId: { in: seedUserIds } }
  })
  console.log(`   ✅ Pedidos eliminados: ${deletedPedidos.count}`)

  // 9. Eliminar usuarios de prueba
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { in: SEED_CLIENT_EMAILS } }
  })
  console.log(`   ✅ Usuarios de prueba eliminados: ${deletedUsers.count}`)

  // 10. Eliminar productos de prueba (solo si no tienen pedidos de clientes reales)
  for (const product of seedProducts) {
    const realOrders = await prisma.itemPedido.count({
      where: { productoId: product.id }
    })

    if (realOrders === 0) {
      await prisma.producto.delete({ where: { id: product.id } })
      console.log(`   ✅ Producto eliminado: ${product.nombre}`)
    } else {
      console.log(`   ⚠️  Producto NO eliminado (tiene ${realOrders} pedidos reales): ${product.nombre}`)
    }
  }

  console.log('')
  console.log('🎉 Limpieza completada!')
  console.log('')
  console.log('ℹ️  Nota: El usuario admin@spheratile.com NO ha sido eliminado.')
}

cleanup()
  .catch((e) => {
    console.error('❌ Error en la limpieza:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
