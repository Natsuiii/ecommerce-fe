// lib/api.ts

// Definisikan tipe untuk opsi request agar lebih aman dengan TypeScript
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: object;
};

// Fungsi wrapper utama untuk semua panggilan API
export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  // Ambil URL dasar dari environment variables
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseURL) {
    throw new Error('API base URL is not configured');
  }

  const url = `${baseURL}${endpoint}`;

  // Siapkan headers
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Siapkan headers dalam satu deklarasi
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Tambahkan header Authorization secara kondisional jika token ada
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(url, {
      method,
      headers, // Kirim object headers yang sudah final
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    // Jika response tidak OK (status code bukan 2xx), lempar error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    // Jika berhasil, kembalikan data dalam format JSON
    return response.json() as Promise<T>;

  } catch (error) {
    console.error('API call failed:', error);
    // Lempar kembali error agar bisa ditangani di komponen
    throw error;
  }
}

export type LoginPayload = {
  email: string;
  password?: string; // Sesuai swagger, password bisa jadi opsional
};

export type LoginResponse = {
  token: string;
  // tambahkan properti lain jika ada, contoh:
  // name: string;
  // email: string;
};

// --- AUTH ---
// POST /api/auth/register [cite: 20]
export const registerUser = (data: object) => {
  // Anda bisa membuatkan tipe spesifik untuk register juga nanti
  return api('/api/auth/register', { method: 'POST', body: data });
};

// POST /api/auth/login
// PERBAIKAN: Beri tahu fungsi 'api' bahwa response-nya akan bertipe 'LoginResponse'
export const loginUser = (data: LoginPayload) => {
  return api<LoginResponse>('/api/auth/login', { method: 'POST', body: data });
};

// --- ME (PROFILE) ---
// GET /api/me [cite: 33]
export const getMyProfile = () => {
  return api('/api/me'); // Method GET adalah default
};

// --- CATALOG ---
// GET /api/products [cite: 45]
export const getProducts = (params: URLSearchParams) => {
  return api(`/api/products?${params.toString()}`);
};

// GET /api/products/{id} [cite: 49]
export const getProductById = (id: string) => {
  return api(`/api/products/${id}`);
};

// Dan seterusnya untuk endpoint lainnya...