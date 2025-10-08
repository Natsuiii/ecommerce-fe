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

export type CheckoutBody = {
  address: {
    name: string;
    phone: string;
    city: string;
    postalCode: string;
    address: string;
  };
  shippingMethod: string;             // e.g. 'JNE REG'
  selectedItemIds: number[];          // id dari item cart (bukan productId)
};

export type OrderItem = {
  id: number;
  qty: number;
  priceSnapshot: number;
  totalAmount: number;
  status: 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  product: { id: number; title: string; slug?: string; images?: string[] };
  // timestamps optional:
  createdAt?: string; shippedAt?: string; completedAt?: string;
};

export type Order = {
  id: number;
  shop: { id: number; name: string; slug?: string; logo?: string };
  paymentStatus?: string;   // PAID / REFUNDED / ...
  items: OrderItem[];
  totalAmount: number;
  createdAt?: string;
};

export type OrdersListResponse = {
  orders: Order[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type CheckoutResponse =
  | { orderIds: number[] }                       
  | { orders: { id: number }[] }
  | any;                                        


  // DETAIL ORDER (by id)
export type OrderDetail = {
  id: number;
  code: string;
  paymentStatus: string;       // e.g. PAID
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
    status: 'NEW'|'CONFIRMED'|'PROCESSING'|'SHIPPED'|'COMPLETED'|'CANCELLED';
    product: { id: number; title: string; images?: string[] };
    shop: { id: number; name: string; slug?: string };
  }>;
};
