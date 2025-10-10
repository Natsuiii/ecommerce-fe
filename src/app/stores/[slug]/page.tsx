'use client';

import { useMemo, useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Store, Star } from 'lucide-react';

import { getStoreBySlug } from '@/lib/api';
import type { StoreDetailResponse, Product } from '@/lib/types';
import { formatIDR, firstImage } from '@/lib/format';

import ProductCard from '@/components/catalog/ProductCard';
import FilterSortSheet, { type SortKey, type OrderKey } from '@/components/catalog/FilterSortSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { connection } from 'next/server';

const PAGE_SIZE = 12;

export default async function StorePage({ params }: { params: { slug: string } }) {
   await connection()
  const slug = params.slug;
  const sp = useSearchParams();
  const router = useRouter();

  // URL → state (biar shareable & refresh-safe)
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [sort, setSort] = useState<SortKey>((sp.get('sort') as SortKey) || 'newest');
  const [order, setOrder] = useState<OrderKey>((sp.get('order') as OrderKey) || 'desc');

  useEffect(() => {
    setQ(sp.get('q') ?? '');
    setSort((sp.get('sort') as SortKey) || 'newest');
    setOrder((sp.get('order') as OrderKey) || 'desc');
  }, [sp]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery<StoreDetailResponse, Error>({
      queryKey: ['store', slug, { q, sort, order }],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams();
        params.set('page', String(pageParam ?? 1));
        params.set('limit', String(PAGE_SIZE));
        if (q.trim()) params.set('q', q.trim());
        if (sort) params.set('sort', sort);
        if (order) params.set('order', order);

        const res = await getStoreBySlug(slug, params);
        const anyRes = res as any;
        return (anyRes?.data as StoreDetailResponse) ?? (anyRes as StoreDetailResponse);
      },
      getNextPageParam: (last) => {
        const { page, totalPages } = last.pagination;
        return page < totalPages ? page + 1 : undefined;
      },
      staleTime: 60_000,
    });

  const shop = data?.pages?.[0]?.shop;
  const products: Product[] = useMemo(
    () => data?.pages.flatMap((pg) => pg.products) ?? [],
    [data]
  );

  const updateUrl = (next: { q?: string; sort?: SortKey; order?: OrderKey }) => {
    const qs = new URLSearchParams(window.location.search);
    if (next.q !== undefined) qs.set('q', next.q);
    if (next.sort) qs.set('sort', next.sort);
    if (next.order) qs.set('order', next.order);
    router.replace(`?${qs.toString()}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <Link href="/products" className="hover:underline">Products</Link> /{' '}
        <span className="text-foreground">{shop?.name ?? 'Store'}</span>
      </div>

      {/* Header Toko */}
      <div className="rounded-xl border p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
          {shop?.logo ? (
            <Image src={shop.logo} alt={shop.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground">
              <Store className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{shop?.name ?? 'Store'}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {shop?.address ?? 'Alamat tidak tersedia'}
            </span>
            <Badge variant="secondary">{shop?._count?.products ?? 0} Products</Badge>
            {shop?.isActive ? <Badge variant="outline">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-current" />
          <span>—</span>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FilterSortSheet
            sort={sort}
            order={order}
            onApply={({ sort: s, order: o }) => {
              setSort(s); setOrder(o);
              updateUrl({ sort: s, order: o });
            }}
          />
          <div className="relative w-[220px]">
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                updateUrl({ q: e.target.value });
              }}
              placeholder="Search in this store"
            />
          </div>
        </div>
      </div>

      {/* Grid produk */}
      {isLoading ? (
        <GridSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            {hasNextPage ? (
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="min-w-[160px]"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load More'}
              </Button>
            ) : (
              products.length > 0 && (
                <div className="text-sm text-muted-foreground">No more products</div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <div className="aspect-[4/3] bg-muted animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
