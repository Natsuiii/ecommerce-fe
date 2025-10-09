import { AuthLoginResponse, CartItemPayload, CartResponse, Category, CategoryResponse, CheckoutBody, CreateProductResponse, LoginPayload, LoginResponse, MeProfile, RegisterPayload, RegisterResponse, SellerActivateBody, SellerActivateResponse, SellerProductsResponse, SellerShopResponse, UpdateMeBody, UpdateShopBody, UpdateShopResponse } from "./types";

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: object | FormData; 
};

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseURL) throw new Error('API base URL is not configured');

  const url = `${baseURL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // ⬇️ kalau body FormData, JANGAN set Content-Type JSON
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body:
        method !== 'GET'
          ? (isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined)
          : undefined,
    });

    if (!response.ok) {
      // response bisa kosong; guard
      let errorMsg = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// --- AUTH ---
// multipart register
export const registerUserMultipart = (data: RegisterPayload) => {
  const fd = new FormData();
  fd.append('name', data.name);
  fd.append('email', data.email);
  fd.append('password', data.password);
  if (data.avatarFile) fd.append('avatar', data.avatarFile);
  if (data.avatarUrl) fd.append('avatarUrl', data.avatarUrl);

  return api<RegisterResponse>('/api/auth/register', { method: 'POST', body: fd });
};

// POST /api/auth/register [cite: 20]
export const registerUser = (data: object) => {
  return api('/api/auth/register', { method: 'POST', body: data });
};

// POST /api/auth/login
export const loginUser = (data: LoginPayload) => {
  return api<AuthLoginResponse>('/api/auth/login', { method: 'POST', body: data });
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

export const activateSeller = (body: SellerActivateBody) => {
  const fd = new FormData();
  fd.append('name', body.name);
  fd.append('slug', body.slug);
  fd.append('address', body.address);
  if (body.logoFile) fd.append('logo', body.logoFile);

  return api<SellerActivateResponse>('/api/seller/activate', {
    method: 'POST',
    body: fd,
  });
};

// GET /api/seller/shop
export const getSellerShop = () =>
  api<SellerShopResponse>('/api/seller/shop');

// PATCH /api/seller/shop  (selalu pakai FormData agar bisa kirim file)
export const updateMyShop = (body: UpdateShopBody) => {
  const fd = new FormData();
  if (body.name) fd.append('name', body.name);
  if (body.slug) fd.append('slug', body.slug);
  if (body.address) fd.append('address', body.address);
  if (body.logoFile) fd.append('logo', body.logoFile);

  return api<UpdateShopResponse>('/api/seller/shop', {
    method: 'PATCH',
    body: fd,
  });
};

// lib/api.ts (tambahkan kalau belum ada)
export const getCategories = () => api<CategoryResponse>('/api/categories');

export const createSellerProduct = (fd: FormData) =>
  api<CreateProductResponse>('/api/seller/products', { method: 'POST', body: fd });

export const getSellerProducts = (params: URLSearchParams) =>
  api<SellerProductsResponse>(`/api/seller/products?${params.toString()}`);
