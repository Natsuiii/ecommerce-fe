'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import ProductCard from '@/components/catalog/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import FilterSortSheet, { SortKey, OrderKey } from '@/components/catalog/FilterSortSheet';
import { getProducts } from '@/lib/api';
import type { ProductsResponse, Product } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

const PAGE_SIZE = 12;

export default function CatalogPage() {
  const searchParams = useSearchParams();

  // state
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [order, setOrder] = useState<OrderKey>('desc');
  const [categoryId, setCategoryId] = useState<string>('');

  // sinkron dari URL → state (trigged setiap kali URL berubah)
  useEffect(() => {
    const cid = searchParams.get('categoryId') ?? '';
    const srt = (searchParams.get('sort') as SortKey) || 'newest';
    const ord = (searchParams.get('order') as OrderKey) || (srt === 'price' ? 'asc' : 'desc');

    setCategoryId(cid);
    setSort(srt);
    setOrder(ord);
  }, [searchParams]);

  // useInfiniteQuery tetap sama, tapi pakai state di key & fetcher
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery<ProductsResponse, Error>({
      queryKey: ['products', { q, sort, order, categoryId }],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams();
        params.set('page', String(pageParam ?? 1));
        params.set('limit', String(PAGE_SIZE));
        if (q.trim()) params.set('q', q.trim());
        if (categoryId) params.set('categoryId', categoryId);
        if (sort) params.set('sort', sort);
        if (order) params.set('order', order);

        const res = await getProducts(params);
        const anyRes = res as any;
        return (anyRes?.data as ProductsResponse) ?? (anyRes as ProductsResponse);
      },
      getNextPageParam: (last) => {
        const { page, totalPages } = last.pagination;
        return page < totalPages ? page + 1 : undefined;
      },
      staleTime: 60_000,
    });

  const products: Product[] = useMemo(
    () => data?.pages.flatMap((pg) => (pg as ProductsResponse).products) ?? [],
    [data]
  );
  const total = data?.pages?.[0]?.pagination?.total ?? 0;

  const handleSortDimension = (dim: SortKey) => {
    setSort(dim);
    if (dim === 'newest') setOrder('desc');     
    if (dim === 'popular') setOrder('desc');    
    if (dim === 'rating') setOrder('desc');     
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
        <p className="text-sm text-muted-foreground">Showing {total} products</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FilterSortSheet
            sort={sort}
            order={order}
            onApply={({ sort: s, order: o }) => {
              setSort(s);
              setOrder(o);
            }}
          />

          {/* Search */}
          <div className="relative w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
        </div>

        {/* Dropdown kanan */}
        <Select value={sort} onValueChange={(v) => handleSortDimension(v as SortKey)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Latest" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="newest">Latest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
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
