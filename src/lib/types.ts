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
