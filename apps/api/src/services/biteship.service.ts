const BITESHIP_API_URL = 'https://api.biteship.com';

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Biteship API response not JSON (status ${response.status}): ${text.substring(0, 200)}`);
  }
}

export async function searchDestinations(apiKey: string, search: string): Promise<any[]> {
  const data = await fetchJson(`${BITESHIP_API_URL}/v1/maps/areas?countries=ID&input=${encodeURIComponent(search)}&type=single`, {
    method: 'GET',
    headers: {
      'Authorization': apiKey,
    },
  });

  const areas = data.areas || [];
  if (!areas.length) return [];
  return areas.map((item: any) => ({
    id: item.id || item.postal_code,
    label: item.name,
    province_name: item.administrative_division_level_1_name,
    city_name: item.administrative_division_level_2_name,
    district_name: item.administrative_division_level_3_name,
    subdistrict_name: item.administrative_division_level_3_name,
    zip_code: String(item.postal_code),
    area_id: item.id,
  }));
}

export interface BiteshipCostResult {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  description: string;
  price: number;
  duration: string;
}

export async function calculateShippingCost(
  apiKey: string,
  originPostalCode: string,
  destinationPostalCode: string,
  weight: number,
  couriers: string,
  itemValue: number = 0
): Promise<BiteshipCostResult[]> {
  if (weight <= 0) throw new Error('Product weight is required for shipping calculation');
  if (itemValue <= 0) throw new Error('Product value is required for shipping calculation');

  const body = {
    origin_postal_code: Number(originPostalCode),
    destination_postal_code: Number(destinationPostalCode),
    couriers,
    items: [{
      name: 'Paket',
      value: itemValue,
      quantity: 1,
      weight,
    }],
  };

  const data = await fetchJson(`${BITESHIP_API_URL}/v1/rates/couriers`, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!data.pricing) return [];
  return data.pricing.map((p: any) => ({
    courier_code: p.courier_code,
    courier_name: p.courier_name,
    service_code: p.courier_service_code,
    service_name: p.courier_service_name,
    description: p.description || '',
    price: p.price,
    duration: p.duration || '',
  }));
}

export interface BiteshipTrackingEvent {
  status: string;
  note: string;
  warehouse_name: string;
  created_at: string;
}

export interface BiteshipTrackingResult {
  delivered: boolean;
  courier: {
    waybill_id: string;
    courier_name: string;
    courier_service: string;
    courier_code: string;
  };
  origin: { name: string };
  destination: { name: string };
  events: BiteshipTrackingEvent[];
}

export interface BiteshipOrderParams {
  origin_contact_name: string;
  origin_contact_phone: string;
  origin_address: string;
  origin_postal_code: number;
  destination_contact_name: string;
  destination_contact_phone: string;
  destination_address: string;
  destination_postal_code: number;
  courier_company: string;
  courier_type: string;
  delivery_type?: string;
  items: {
    name: string;
    description?: string;
    category?: string;
    value: number;
    quantity: number;
    weight: number;
    height?: number;
    length?: number;
    width?: number;
  }[];
  reference_id?: string;
  order_note?: string;
}

export interface BiteshipOrderResult {
  id: string;
  courier: {
    waybill_id: string;
    tracking_id: string;
    company: string;
    type: string;
  };
  status: string;
  price: number;
}

export async function createOrder(apiKey: string, params: BiteshipOrderParams): Promise<BiteshipOrderResult> {
  const data = await fetchJson(`${BITESHIP_API_URL}/v1/orders`, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      delivery_type: params.delivery_type || 'now',
    }),
  });

  if (!data.success) {
    throw new Error(data.error || 'Failed to create Biteship order');
  }

  return {
    id: data.id,
    courier: {
      waybill_id: data.courier.waybill_id,
      tracking_id: data.courier.tracking_id,
      company: data.courier.company,
      type: data.courier.type,
    },
    status: data.status,
    price: data.price,
  };
}

export async function trackWaybill(apiKey: string, waybillId: string, courierCode?: string): Promise<BiteshipTrackingResult> {
  const endpoint = courierCode
    ? `${BITESHIP_API_URL}/v1/trackings/${waybillId}/couriers/${courierCode}`
    : `${BITESHIP_API_URL}/v1/trackings/${waybillId}`;
  const data = await fetchJson(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': apiKey,
    },
  });

  return {
    delivered: data.status === 'delivered',
    courier: data.courier || { waybill_id: waybillId, courier_name: '', courier_service: '', courier_code: courierCode || '' },
    origin: data.origin || { name: '' },
    destination: data.destination || { name: '' },
    events: (data.history || data.events || []).map((e: any) => ({
      status: e.status || '',
      note: e.note || '',
      warehouse_name: e.warehouse_name || '',
      created_at: e.updated_at || e.created_at || '',
    })),
  };
}
