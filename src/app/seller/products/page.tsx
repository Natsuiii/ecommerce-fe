import { Suspense } from 'react';
import ProductsView from './ProductsView'; // Impor komponen klien yang baru saja dibuat

// Ini adalah komponen fallback sederhana selagi menunggu
function ProductsLoading() {
  return (
    <div className="px-4 py-6 md:py-8">
      <h1 className="text-xl font-semibold mb-4">Products</h1>
      <div className="border rounded-lg p-6 text-center text-muted-foreground">
        Loading products...
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsView />
    </Suspense>
  );
}