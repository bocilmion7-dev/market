const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || '';
const RAJAONGKIR_API_URL = process.env.RAJAONGKIR_API_URL || 'https://api.rajaongkir.com/starter';

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
