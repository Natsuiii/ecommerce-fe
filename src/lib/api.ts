import { CartItemPayload, CartResponse, CheckoutBody, MeProfile, UpdateMeBody } from "./types";

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: object;
};

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseURL) throw new Error('API base URL is not configured');

  const url = `${baseURL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const headers: HeadersInit = {
    ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = (json && (json.message || json.error || json.msg)) || 'Something went wrong';
      throw new Error(message);
    }

    const unwrapped = json && typeof json === 'object' && 'data' in json ? json.data : json;
    return unwrapped as T;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}


export type LoginPayload = {
  email: string;
  password?: string; 
};

export type LoginResponse = {
  token: string;
};

// --- AUTH ---
// POST /api/auth/register [cite: 20]
export const registerUser = (data: object) => {
  return api('/api/auth/register', { method: 'POST', body: data });
};

// POST /api/auth/login
export const loginUser = (data: LoginPayload) => {
  return api<LoginResponse>('/api/auth/login', { method: 'POST', body: data });
};

export type UserProfile = {
  name: string;
  email: string;
  shop: { id: string; name: string } | null;
};

// --- ME (PROFILE) ---
// GET /api/me [cite: 33]
export const getMyProfile = () => api<UserProfile>('/api/me');

// --- CATALOG ---
// GET /api/products [cite: 45]
export const getProducts = (params: URLSearchParams) => {
  return api(`/api/products?${params.toString()}`);
};

// GET /api/products/{id} [cite: 49]
export const getProductById = (id: string) => {
  return api(`/api/products/${id}`);
};

export const getStoreBySlug = (slug: string, params: URLSearchParams) => {
  const query = params.toString();
  const suffix = query ? `?${query}` : '';
  return api(`/api/stores/slug/${slug}${suffix}`);
};


// GET /api/cart
export const getCart = () => api<CartResponse>('/api/cart');

// DELETE /api/cart
export const clearCart = () => api('/api/cart', { method: 'DELETE' });

// POST /api/cart/items
export const addCartItem = (body: CartItemPayload) =>
  api('/api/cart/items', { method: 'POST', body });

// PATCH /api/cart/items/{itemId}
export const updateCartItem = (itemId: number, qty: number) =>
  api(`/api/cart/items/${itemId}`, { method: 'PATCH', body: { qty } });

// DELETE /api/cart/items/{itemId}
export const removeCartItem = (itemId: number) =>
  api(`/api/cart/items/${itemId}`, { method: 'DELETE' });

// POST /api/orders/checkout
export const checkoutOrders = (body: CheckoutBody) =>
  api('/api/orders/checkout', { method: 'POST', body });

// GET /api/orders/my?page=&limit=&paymentStatus=
export const getMyOrders = (params: URLSearchParams) => {
  const q = params.toString();
  return api(`/api/orders/my${q ? `?${q}` : ''}`);
};

// GET /api/orders/{id}
export const getOrderById = (id: number | string) =>
  api(`/api/orders/${id}`);

// PATCH /api/orders/items/{id}/complete
export const completeOrderItem = (id: number | string) =>
  api(`/api/orders/items/${id}/complete`, { method: 'PATCH' });

// (opsional) cancel seluruh order toko
export const cancelOrder = (id: number | string, reason: string) =>
  api(`/api/orders/${id}/cancel`, { method: 'PATCH', body: { reason } });

// ---- ME (full) ----
export const getMe = () => api<MeProfile>('/api/me');

export const updateMe = (body: UpdateMeBody) =>
  api<MeProfile>('/api/me', { method: 'PATCH', body });