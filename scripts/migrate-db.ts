import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  console.log('📦 Exportando datos...');

  const data = {
    users: await prisma.user.findMany(),
    productos: await prisma.producto.findMany(),
    pedidos: await prisma.pedido.findMany({
      include: { items: true },
    }),
    albaranes: await prisma.albaran.findMany(),
    facturas: await prisma.factura.findMany({
      include: { items: true },
    }),
    resetTokens: await prisma.resetToken.findMany(),
    configuracionSitio: await prisma.configuracionSitio.findMany(),
  };

  fs.writeFileSync('db-export.json', JSON.stringify(data, null, 2));
  console.log('✅ Datos exportados a db-export.json');
}

async function importData() {
  console.log('📥 Importando datos...');

  const data = JSON.parse(fs.readFileSync('db-export.json', 'utf-8'));

  // Users
  let count = 0;
  for (const user of data.users) {
    try {
      await prisma.user.create({ data: user });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') {
        // Duplicate - skip
        continue;
      }
      throw e;
    }
  }
  console.log(`✅ ${count} Users importados`);

  // Productos
  count = 0;
  for (const producto of data.productos) {
    try {
      await prisma.producto.create({ data: producto });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') continue;
      throw e;
    }
  }
  console.log(`✅ ${count} Productos importados`);

  // Pedidos con items
  count = 0;
  for (const pedido of data.pedidos) {
    try {
      await prisma.pedido.create({
        data: {
          ...pedido,
          items: {
            create: pedido.items.map((item: any) => ({
              productoId: item.productoId,
              producto_nombre: item.producto_nombre,
              producto_referencia: item.producto_referencia,
              cantidad_m2: item.cantidad_m2,
              cantidad_cajas: item.cantidad_cajas,
              precio_m2: item.precio_m2,
              subtotal: item.subtotal,
            })),
          },
        },
      });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') continue;
      throw e;
    }
  }
  console.log(`✅ ${count} Pedidos importados`);

  // Albaranes
  count = 0;
  for (const albaran of data.albaranes) {
    try {
      await prisma.albaran.create({ data: albaran });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') continue;
      throw e;
    }
  }
  console.log(`✅ ${count} Albaranes importados`);

  // Facturas con items
  count = 0;
  for (const factura of data.facturas) {
    try {
      await prisma.factura.create({
        data: {
          ...factura,
          items: {
            create: factura.items.map((item: any) => ({
              productoId: item.productoId,
              producto_nombre: item.producto_nombre,
              producto_referencia: item.producto_referencia,
              producto_slug: item.producto_slug,
              producto_imagen: item.producto_imagen,
              cantidad_m2: item.cantidad_m2,
              cantidad_cajas: item.cantidad_cajas,
              precio_m2: item.precio_m2,
              subtotal: item.subtotal,
            })),
          },
        },
      });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') continue;
      throw e;
    }
  }
  console.log(`✅ ${count} Facturas importadas`);

  // ResetTokens
  count = 0;
  for (const token of data.resetTokens) {
    try {
      await prisma.resetToken.create({ data: token });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') continue;
      throw e;
    }
  }
  console.log(`✅ ${count} ResetTokens importados`);

  // Configuración
  count = 0;
  for (const config of data.configuracionSitio) {
    try {
      await prisma.configuracionSitio.create({ data: config });
      count++;
    } catch (e: any) {
      if (e.code === 'P2002') continue;
      throw e;
    }
  }
  console.log(`✅ ${count} Configuraciones importadas`);

  console.log('✅ Todos los datos importados');
}

const command = process.argv[2];

if (command === 'export') {
  exportData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
} else if (command === 'import') {
  importData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
} else {
  console.log('Uso: tsx migrate-db.ts [export|import]');
  process.exit(1);
}
