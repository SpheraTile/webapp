import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos...');

  // Drop all tables in reverse dependency order
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ItemFactura" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Factura" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ItemPedido" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Albaran" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Pedido" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Producto" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ResetToken" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "ConfiguracionSitio" CASCADE;`);

  // Drop enums
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "TipoIdentificacion" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "FormaCobro" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Calidad" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "MateriaPrima" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Aspecto" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Acabado" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "TipoPieza" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Uso" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "EstadoProducto" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "EstadoPedido" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "EstadoAlbaran" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "EstadoFactura" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "MetodoPago" CASCADE;`);

  console.log('✅ Base de datos limpiada');
  await prisma.$disconnect();
}

cleanDatabase();
