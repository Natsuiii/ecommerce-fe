import { Suspense } from 'react';
import CatalogPage from './CatalogPage'; // Sesuaikan path jika perlu

// Anda bisa membuat skeleton loading terpisah atau menggunakan yang sudah ada
function CatalogLoadingSkeleton() {
  return <div>Loading catalog...</div>; // Ganti dengan komponen skeleton Anda jika mau
}

export default function Page() {
  return (
    <Suspense fallback={<CatalogLoadingSkeleton />}>
      <CatalogPage />
    </Suspense>
  );
}