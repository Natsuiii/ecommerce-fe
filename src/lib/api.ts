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
    'Content-Type': 'application/json',
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