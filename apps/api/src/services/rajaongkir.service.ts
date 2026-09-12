const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || '';
const RAJAONGKIR_API_URL = process.env.RAJAONGKIR_API_URL || 'https://api.rajaongkir.com/starter';
const RAJAONGKIR_TRACKING_URL = process.env.RAJAONGKIR_TRACKING_URL || 'https://rajaongkir.komerce.id/api/v1';

interface RajaOngkirCostResult {
  cost: { value: number; etd: string; note: string }[];
  service: string;
  description: string;
}

export async function getProvinces(): Promise<any[]> {
  const response = await fetch(`${RAJAONGKIR_API_URL}/province`, {
    headers: { key: RAJAONGKIR_API_KEY, type: 'city' },
  });
  const data = await response.json() as any;
  return data.rajaongkir?.results || [];
}

export async function getCities(provinceId?: string): Promise<any[]> {
  const url = provinceId ? `${RAJAONGKIR_API_URL}/city?province=${provinceId}` : `${RAJAONGKIR_API_URL}/city`;
  const response = await fetch(url, {
    headers: { key: RAJAONGKIR_API_KEY, type: 'city' },
  });
  const data = await response.json() as any;
  return data.rajaongkir?.results || [];
}

export async function getAreaId(areaName: string): Promise<string> {
  const cities = await getCities();
  const city = cities.find((c: any) => c.city_name.toLowerCase().includes(areaName.toLowerCase()));
  return city?.city_id || '152';
}

export async function calculateShippingCost(
  origin: string,
  destination: string,
  weight: number,
  courier: string
): Promise<RajaOngkirCostResult[]> {
  const body = new URLSearchParams({ origin, destination, weight: String(weight), courier });

  const response = await fetch(`${RAJAONGKIR_API_URL}/cost`, {
    method: 'POST',
    headers: {
      key: RAJAONGKIR_API_KEY,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json() as any;
  return data.rajaongkir?.results || [];
}

export async function getDistricts(cityId: string): Promise<any[]> {
  const response = await fetch(`${RAJAONGKIR_API_URL}/subdistrict?city=${cityId}`, {
    headers: { key: RAJAONGKIR_API_KEY, type: 'city' },
  });
  const data = await response.json() as any;
  return data.rajaongkir?.results || [];
}

export interface TrackingEvent {
  manifest_code: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name: string;
}

export interface TrackingResult {
  delivered: boolean;
  summary: {
    courier_code: string;
    courier_name: string;
    waybill_number: string;
    service_code: string;
    waybill_date: string;
    shipper_name: string;
    receiver_name: string;
    origin: string;
    destination: string;
  };
  delivery_status: {
    status: string;
    pod_receiver: string;
    pod_date: string;
    pod_time: string;
  };
  manifest: TrackingEvent[];
}

export async function trackWaybill(awb: string, courier: string): Promise<TrackingResult | null> {
  const url = new URL(`${RAJAONGKIR_TRACKING_URL}/track/waybill`);
  url.searchParams.set('awb', awb);
  url.searchParams.set('courier', courier);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      key: RAJAONGKIR_API_KEY,
    },
  });

  const data = await response.json() as any;

  if (!data.data) {
    return null;
  }

  return {
    delivered: data.data.delivered || false,
    summary: {
      courier_code: data.data.summary?.courier_code || '',
      courier_name: data.data.summary?.courier_name || '',
      waybill_number: data.data.summary?.waybill_number || '',
      service_code: data.data.summary?.service_code || '',
      waybill_date: data.data.summary?.waybill_date || '',
      shipper_name: data.data.summary?.shipper_name || '',
      receiver_name: data.data.summary?.receiver_name || '',
      origin: data.data.summary?.origin || '',
      destination: data.data.summary?.destination || '',
    },
    delivery_status: {
      status: data.data.delivery_status?.status || '',
      pod_receiver: data.data.delivery_status?.pod_receiver || '',
      pod_date: data.data.delivery_status?.pod_date || '',
      pod_time: data.data.delivery_status?.pod_time || '',
    },
    manifest: (data.data.manifest || []).map((m: any) => ({
      manifest_code: m.manifest_code || '',
      manifest_description: m.manifest_description || '',
      manifest_date: m.manifest_date || '',
      manifest_time: m.manifest_time || '',
      city_name: m.city_name || '',
    })),
  };
}
