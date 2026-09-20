const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';
const GUEST_ID_KEY = 'marketplace_guest_id';

function getGuestId(): string | null {
  try {
    return localStorage.getItem(GUEST_ID_KEY);
  } catch {
    return null;
  }
}

export function getOrCreateGuestId(): string {
  let guestId = getGuestId();
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function clearGuestId() {
  localStorage.removeItem(GUEST_ID_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Send guest ID if no auth
  const guestId = getGuestId();
  if (guestId) {
    headers['x-guest-id'] = guestId;
  }

  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error?.message || 'Request failed');
  }
  return data.data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
