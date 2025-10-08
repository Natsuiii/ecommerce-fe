export type Shop = { id: number; name: string; slug: string; logo?: string };
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
  pagination: { page: number; limit: number; total: number; totalPages: number };
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
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type CartItemPayload = { productId: number; qty: number };

export type CartItem = {
  id: number;             // itemId
  productId: number;
  qty: number;
  price: number;
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
