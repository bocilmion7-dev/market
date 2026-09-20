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
  const payload = { banners: limited } as any;
  return prisma.setting.upsert({
    where: { key: 'home_banners' },
    update: { value: payload, updatedBy },
    create: { key: 'home_banners', value: payload, updatedBy },
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

export async function getAnnouncementText(): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key: 'announcement_text' } });
  return (setting?.value as any)?.text || '';
}

export async function updateAnnouncementText(text: string, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'announcement_text' },
    update: { value: { text }, updatedBy },
    create: { key: 'announcement_text', value: { text }, updatedBy },
  });
}

export interface ShippingProvider {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
}

export interface ActiveCourier {
  code: string;
  name: string;
  providers: string[];
}

export async function getShippingProviders(): Promise<ShippingProvider[]> {
  const setting = await prisma.setting.findUnique({ where: { key: 'shipping_providers' } });
  return (setting?.value as any)?.providers || [
    { id: 'rajaongkir', name: 'RajaOngkir', enabled: true, apiKey: '' },
    { id: 'biteship', name: 'Biteship', enabled: false, apiKey: '' },
  ];
}

export async function updateShippingProviders(providers: ShippingProvider[], updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'shipping_providers' },
    update: { value: { providers } as any, updatedBy },
    create: { key: 'shipping_providers', value: { providers } as any, updatedBy },
  });
}

export async function getActiveCouriers(): Promise<ActiveCourier[]> {
  const setting = await prisma.setting.findUnique({ where: { key: 'active_couriers' } });
  return (setting?.value as any)?.couriers || [
    { code: 'jne', name: 'JNE', providers: ['rajaongkir', 'biteship'] },
    { code: 'jnt', name: 'J&T', providers: ['rajaongkir', 'biteship'] },
    { code: 'sicepat', name: 'SiCepat', providers: ['rajaongkir', 'biteship'] },
    { code: 'anteraja', name: 'AnterAja', providers: ['rajaongkir', 'biteship'] },
  ];
}

export async function updateActiveCouriers(couriers: ActiveCourier[], updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'active_couriers' },
    update: { value: { couriers } as any, updatedBy },
    create: { key: 'active_couriers', value: { couriers } as any, updatedBy },
  });
}

export interface MidtransSettings {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export async function getMidtransSettings(): Promise<MidtransSettings> {
  const setting = await prisma.setting.findUnique({ where: { key: 'midtrans_settings' } });
  return (setting?.value as any) || { serverKey: '', clientKey: '', isProduction: false };
}

export async function updateMidtransSettings(data: MidtransSettings, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'midtrans_settings' },
    update: { value: data as any, updatedBy },
    create: { key: 'midtrans_settings', value: data as any, updatedBy },
  });
}

export interface QrisSettings {
  enabled: boolean;
  qrImageUrl: string;
}

export async function getQrisSettings(): Promise<QrisSettings> {
  const setting = await prisma.setting.findUnique({ where: { key: 'qris_settings' } });
  return (setting?.value as any) || { enabled: false, qrImageUrl: '' };
}

export async function updateQrisSettings(data: QrisSettings, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'qris_settings' },
    update: { value: data as any, updatedBy },
    create: { key: 'qris_settings', value: data as any, updatedBy },
  });
}

export interface WhatsappSettings {
  phoneNumber: string;
}

export async function getWhatsappSettings(): Promise<WhatsappSettings> {
  const setting = await prisma.setting.findUnique({ where: { key: 'whatsapp_settings' } });
  return (setting?.value as any) || { phoneNumber: '' };
}

export async function updateWhatsappSettings(data: WhatsappSettings, updatedBy: string) {
  return prisma.setting.upsert({
    where: { key: 'whatsapp_settings' },
    update: { value: data as any, updatedBy },
    create: { key: 'whatsapp_settings', value: data as any, updatedBy },
  });
}
