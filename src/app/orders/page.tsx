'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import dayjs from 'dayjs';

import { getMyOrders } from '@/lib/api';
import type { OrdersListResponse, Order } from '@/lib/types';
import { formatIDR, firstImage } from '@/lib/format';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const q = useInfiniteQuery<OrdersListResponse>({
    queryKey: ['orders'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam ?? 1));
      params.set('limit', String(PAGE_SIZE));
      const res = await getMyOrders(params);
      const any = res as any;
      return (any?.data as OrdersListResponse) ?? (any as OrdersListResponse);
    },
    getNextPageParam: (last) => {
      const { page, totalPages } = last.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30_000,
  });

  const orders: Order[] = q.data?.pages.flatMap(p => p.orders) ?? [];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map(o => (
          <Link key={o.id} href={`/orders/${o.id}`} className="block rounded-xl border p-4 hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{o.shop?.name ?? 'Store'}</div>
              <div className="text-sm text-muted-foreground">{dayjs(o.createdAt).format('DD MMM YYYY HH:mm')}</div>
            </div>
            <div className="mt-3 flex items-center gap-3 overflow-auto">
              {o.items.slice(0, 4).map(it => (
                <div key={it.id} className="relative h-14 w-14 rounded bg-muted overflow-hidden shrink-0">
                  <Image src={firstImage(it.product.images)} alt={it.product.title} fill className="object-cover" />
                </div>
              ))}
              <div className="ml-auto text-sm font-medium">{formatIDR(o.totalAmount)}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        {q.hasNextPage && (
          <Button variant="secondary" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
            {q.isFetchingNextPage ? 'Loading…' : 'Load More'}
          </Button>
        )}
      </div>
    </div>
  );
}
