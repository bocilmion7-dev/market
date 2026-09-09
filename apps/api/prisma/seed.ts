import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN_MAKER' },
    update: {},
    create: { name: 'ADMIN_MAKER', description: 'Full admin access' },
  });

  const publisherRole = await prisma.role.upsert({
    where: { name: 'PRODUCT_PUBLISHER' },
    update: {},
    create: { name: 'PRODUCT_PUBLISHER', description: 'Product publisher' },
  });

  // Create initial admin
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@marketplace.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Admin Maker',
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  // Create default admin fee setting
  await prisma.setting.upsert({
    where: { key: 'admin_fee_percentage' },
    update: {},
    create: {
      key: 'admin_fee_percentage',
      value: { percentage: 10 },
      updatedBy: admin.id,
    },
  });

  console.log('Seed completed:', { adminEmail, roles: ['ADMIN_MAKER', 'PRODUCT_PUBLISHER'] });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
