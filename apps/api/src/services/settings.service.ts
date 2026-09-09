import { prisma } from '../lib/prisma';

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, any>);
}

export async function getAdminFee() {
  const setting = await prisma.setting.findUnique({ where: { key: 'admin_fee_percentage' } });
  return setting?.value || { percentage: 10 };
}

export async function updateAdminFee(percentage: number, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'admin_fee_percentage' },
    update: { value: { percentage }, updatedBy },
    create: { key: 'admin_fee_percentage', value: { percentage }, updatedBy },
  });
}
