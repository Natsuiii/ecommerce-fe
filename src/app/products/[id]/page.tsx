'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Star } from 'lucide-react';

import { getProductById, getProducts } from '@/lib/api';
import type { InfiniteData } from '@tanstack/react-query';
import { formatIDR } from '@/lib/format';
import type { ProductDetail } from '@/lib/types';

import ProductGallery from '@/components/catalog/ProductGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { ProductsResponse } from '@/lib/types';

function toIdFromParam(param: string) {
  const idPart = param.split('-')[0];
  return idPart;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = toIdFromParam(params.id);

  const router = useRouter();                
  const queryClient = useQueryClient();      
  const [catLoading, setCatLoading] = useStateSafe(false); 

  const { data, isLoading, isError } = useQuery<ProductDetail, Error>({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      const res = await getProductById(String(id));
      const anyRes = res as any;
      const payload: ProductDetail = (anyRes?.data as ProductDetail) ?? (anyRes as ProductDetail);
      if (!payload || !payload.id) throw new Error('Product not found');
      return payload;
    },
    staleTime: 60_000,
  });

  if (isError) return notFound();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-4">
        <span className="hover:underline cursor-pointer">Home</span> /{' '}
        <span className="hover:underline cursor-pointer">Products</span> /{' '}
        <span className="text-foreground">{data?.title ?? '...'}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-5">
          {isLoading ? <GallerySkeleton /> : <ProductGallery images={data?.images} />}
        </div>

        {/* Detail */}
        <div className="lg:col-span-7 space-y-5">
          {isLoading ? (
            <DetailSkeleton />
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{data?.title}</h1>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{(data?.rating ?? 0).toFixed(1)}</span>
                  </div>
                  <span>·</span>
                  <span>{data?.soldCount ?? 0} Sold</span>
                </div>
              </div>

              <div className="mt-2">
                {data?.category?.id && (
                  <Badge
                    role="button"
                    onClick={async () => {
                      if (!data?.category?.id) return;
                      setCatLoading(true);
                      const cid = String(data.category.id);

                      const key = ['products', { q: '', sort: 'newest', order: 'desc', categoryId: cid }];

                      await queryClient.prefetchInfiniteQuery<ProductsResponse>({
                        queryKey: key,
                        initialPageParam: 1,
                        queryFn: async ({ pageParam }) => {
                          const params = new URLSearchParams();
                          params.set('page', String(pageParam ?? 1));
                          params.set('limit', '12');
                          params.set('categoryId', cid);
                          params.set('sort', 'newest');
                          params.set('order', 'desc');
                          const res = await getProducts(params);
                          const anyRes = res as any;
                          return (anyRes?.data as ProductsResponse) ?? (anyRes as ProductsResponse);
                        },
                        getNextPageParam: (last: any) => {
                          const { page, totalPages } = last.pagination;
                          return page < totalPages ? page + 1 : undefined;
                        },
                      });

                      const first = queryClient.getQueryData<InfiniteData<ProductsResponse>>(key);
                      if (!first) {
                        const params = new URLSearchParams({ page: '1', limit: '12', categoryId: cid, sort: 'newest', order: 'desc' });
                        const res = await getProducts(params);
                        const anyRes = res as any;
                        const payload: ProductsResponse = (anyRes?.data as ProductsResponse) ?? (anyRes as ProductsResponse);
                        queryClient.setQueryData<InfiniteData<ProductsResponse>>(key, { pages: [payload], pageParams: [1] });
                      }

                      setCatLoading(false);
                      router.push(`/products?categoryId=${cid}&sort=newest&order=desc`);
                    }}
                    className={`rounded-full cursor-pointer ${catLoading ? 'opacity-60 pointer-events-none' : ''}`}
                    variant="outline"
                  >
                    {catLoading ? 'Loading…' : data.category.name}
                  </Badge>
                )}
              </div>

              <div className="text-3xl font-semibold">{formatIDR(data?.price ?? 0)}</div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Stock:</span>
                <span className="font-medium">{data?.stock ?? 0}</span>
              </div>

              <Separator />

              {/* Shop */}
              <div className="flex items-center gap-2 text-sm">
                <BadgeCheck className="h-5 w-5 text-sky-600" />
                <span className="font-medium">{data?.shop?.name}</span>
              </div>

              {/* Quantity + CTA */}
              <div className="flex items-center gap-3">
                <QuantityPicker />
                <Button className="px-6">Add to Cart</Button>
                <Button variant="outline">Buy Now</Button>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {data?.description || 'No description.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function QuantityPicker() {
  const [qty, setQty] = useStateSafe(1);
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</Button>
      <Input
        value={qty}
        onChange={(e) => {
          const v = parseInt(e.target.value || '1', 10);
          setQty(Number.isNaN(v) ? 1 : Math.max(1, v));
        }}
        className="w-16 text-center"
        inputMode="numeric"
      />
      <Button variant="outline" size="icon" onClick={() => setQty((q) => q + 1)}>+</Button>
    </div>
  );
}

// small internal hook to avoid SSR mismatch on initial value
import * as React from 'react';
function useStateSafe<T>(initial: T) {
  const [v, s] = React.useState<T>(initial);
  return [v, s] as const;
}

function GallerySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-muted" />
      <div className="grid grid-cols-5 gap-2 mt-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
function DetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-3/4 bg-muted rounded" />
      <div className="h-8 w-1/3 bg-muted rounded" />
      <div className="h-5 w-1/5 bg-muted rounded" />
      <div className="h-10 w-2/3 bg-muted rounded" />
    </div>
  );
}
