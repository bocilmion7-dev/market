import { prisma } from '../lib/prisma';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  active: boolean;
}

export interface SiteSettings {
  site_name: string;
  site_footer: {
    address: string;
    phone: string;
    email: string;
    mapUrl: string;
    mapEmbedUrl: string;
    description: string;
  };
}

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

export async function getBanners(): Promise<Banner[]> {
  const setting = await prisma.setting.findUnique({ where: { key: 'home_banners' } });
  return (setting?.value as any)?.banners || [];
}

export async function updateBanners(banners: Banner[], updatedBy: string) {
  const limited = banners.slice(0, 5);
  return prisma.setting.upsert({
    where: { key: 'home_banners' },
    update: { value: { banners: limited }, updatedBy },
    create: { key: 'home_banners', value: { banners: limited }, updatedBy },
  });
}

export async function getPublicBanners(): Promise<Banner[]> {
  const setting = await prisma.setting.findUnique({ where: { key: 'home_banners' } });
  const all = (setting?.value as any)?.banners || [];
  return all.filter((b: Banner) => b.active);
}

export async function getSiteName(): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key: 'site_name' } });
  return (setting?.value as any)?.name || 'Marketplace';
}

export async function updateSiteName(name: string, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'site_name' },
    update: { value: { name }, updatedBy },
    create: { key: 'site_name', value: { name }, updatedBy },
  });
}

export async function getSiteFooter() {
  const setting = await prisma.setting.findUnique({ where: { key: 'site_footer' } });
  return (setting?.value as any) || {
    address: '',
    phone: '',
    email: '',
    mapUrl: '',
    mapEmbedUrl: '',
    description: '',
  };
}

export async function updateSiteFooter(footer: any, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'site_footer' },
    update: { value: footer, updatedBy },
    create: { key: 'site_footer', value: footer, updatedBy },
  });
}
