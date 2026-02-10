import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupPgvector() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('✅ Extensión pgvector instalada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPgvector();
