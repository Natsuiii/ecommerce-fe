export type CategoryResponse = {
  success: boolean;
  message?: string;
  data: {
    categories: Category[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Category = { id: number; name: string; slug: string };

export type Product = {
  id: number;
  title: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  category: Category;
  shop: Shop;
};

export type ProductsResponse = {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Review = {
  id?: number;
  rating: number;
  comment?: string;
  userName?: string;
  createdAt?: string;
};

export type ProductDetail = Product & {
  description?: string;
  isActive?: boolean;
  shopId?: number;
  categoryId?: number;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
};

export type ShopWithCount = Shop & {
  address?: string | null;
  isActive?: boolean;
  createdAt?: string;
  _count?: { products: number };
};

export type StoreDetailResponse = {
  shop: ShopWithCount;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CartItemPayload = { productId: number; qty: number };

export type CartItem = {
  id: number; // itemId
  productId: number;
  qty: number;
  priceSnapshot: number;
  subtotal: number;
  product: {
    id: number;
    title: string;
    slug?: string;
    price: number;
    images?: string[];
    shop?: { id: number; name: string; slug?: string; logo?: string };
  };
};

export type CartGroup = {
  shop: { id: number; name: string; slug?: string; logo?: string };
  items: CartItem[];
  subtotal: number;
};

export type CartResponse = {
  groups: CartGroup[];
  grandTotal: number;
};

export type CheckoutBody = {
  address: {
    name: string;
    phone: string;
    city: string;
    postalCode: string;
    address: string;
  };
  shippingMethod: string; // e.g. 'JNE REG'
  selectedItemIds: number[]; // id dari item cart (bukan productId)
};

export type OrderItem = {
  id: number;
  qty: number;
  priceSnapshot: number;
  totalAmount: number;
  status:
    | "NEW"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "COMPLETED"
    | "CANCELLED";
  product: { id: number; title: string; slug?: string; images?: string[] };
  // timestamps optional:
  createdAt?: string;
  shippedAt?: string;
  completedAt?: string;
};

export type Order = {
  id: number;
  shop: { id: number; name: string; slug?: string; logo?: string };
  paymentStatus?: string; // PAID / REFUNDED / ...
  items: OrderItem[];
  totalAmount: number;
  createdAt?: string;
};

export type OrdersListResponse = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CheckoutResponse =
  | { orderIds: number[] }
  | { orders: { id: number }[] }
  | any;

// DETAIL ORDER (by id)
export type OrderDetail = {
  id: number;
  code: string;
  paymentStatus: string; // e.g. PAID
  address?: string;
  addressDetail?: {
    name: string;
    phone: string;
    city: string;
    postalCode: string;
    address: string;
    shippingMethod: string;
  };
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    shopId: number;
    qty: number;
    priceSnapshot: number;
    status:
      | "NEW"
      | "CONFIRMED"
      | "PROCESSING"
      | "SHIPPED"
      | "COMPLETED"
      | "CANCELLED";
    product: { id: number; title: string; images?: string[] };
    shop: { id: number; name: string; slug?: string };
  }>;
};

// ---- Profile ----
export type MeStats = {
  orders?: number;
  completedItems?: number;
  hasShop?: boolean;
  totalOrders?: number; // jagain bila backend pakai nama lain
  totalSpend?: number;
  [k: string]: any;
};

export type MeProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  shop?: { id: number; name: string; slug?: string } | null;
  stats?: MeStats;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateMeBody = {
  name?: string;
  phone?: string;
  avatarUrl?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  avatarFile?: File | null; // <input type="file">
  avatarUrl?: string; // alternatif jika tanpa upload
};

export type RegisterResponse = {
  token?: string; // kalau backend mengembalikan token saat register
};

export type LoginPayload = {
  email: string;
  password: string; // ← wajibkan password
};

export type LoginResponse = {
  success?: boolean;
  message?: string;
  data: {
    token: string;
    user?: { id: number; name: string; email: string; avatarUrl?: string };
  };
};

export type AuthLoginResponse = {
  success?: boolean;
  message?: string;
  data: {
    token: string;
    user?: { id: number; name: string; email: string; avatarUrl?: string };
  };
};

export type ActivateSellerPayload = {
  name: string;
  slug: string;
  address: string;
  logo?: File; // optional
};

export type Shop = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
};

// --- SELLER / SHOP ---
// Payload untuk POST /api/seller/activate
export type SellerActivateBody = {
  name: string;
  slug: string;
  address: string;
  logoFile?: File; // opsional
};

// Response shape umum dari seller endpoints
export type ShopProfile = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
};

export type SellerActivateResponse = {
  success?: boolean;
  message?: string;
  data: ShopProfile;
};

// PATCH /api/seller/shop
export type UpdateShopBody = {
  name?: string;
  slug?: string;
  address?: string;
  logoFile?: File; // opsional
  isActive?: boolean;
};
export type UpdateShopResponse = {
  success?: boolean;
  message?: string;
  data: ShopProfile;
};

export type SellerShop = {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number; orderItems: number };
};

export type SellerShopResponse = {
  success: boolean;
  message?: string;
  data: SellerShop;
};

export type CreateProductResponse = {
  success: boolean;
  message?: string;
  data: {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    isActive: boolean;
    rating: number;
    reviewCount: number;
    soldCount: number;
    shopId: number;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
  };
};

export type SellerProductsResponse = {
  success: boolean;
  message?: string;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type SellerProduct = {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  shopId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}
