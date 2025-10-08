'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';

import { getOrderById, completeOrderItem } from '@/lib/api';
import type { OrderDetail } from '@/lib/types';
import { formatIDR, firstImage } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  // ---- 1) HOOKS SELALU DI TOP-LEVEL, TANPA KONDISI ----
  const router = useRouter();

  const q = useQuery<OrderDetail>({
    queryKey: ['order', params.id],
    queryFn: async () => {
      const res = await getOrderById(params.id);
      const any = res as any;
      return (any?.data as OrderDetail) ?? (any as OrderDetail);
    },
    staleTime: 30_000,
  });

  // SATU mutation untuk semua item
  const completeM = useMutation({
    mutationFn: (itemId: number) => completeOrderItem(itemId),
    onSuccess: () => q.refetch(),
  });

  // ---- 2) BOLEH RETURN KINI, SETELAH SEMUA HOOK DIATAS TERPANGGIL ----
  if (q.isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-40 rounded-xl border bg-muted animate-pulse" />
      </div>
    );
  }
  if (q.isError || !q.data) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-red-500">Order not found.</p>
      </div>
    );
  }

  const o = q.data;
  const shopName = o.items[0]?.shop?.name ?? 'Store';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 text-sm text-muted-foreground">
        <Link href="/orders" className="hover:underline">Orders</Link> / <span>#{o.id}</span>
      </div>

      <div className="rounded-xl border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Order</div>
            <div className="text-xl font-semibold">#{o.code ?? o.id}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            {dayjs(o.createdAt).format('DD MMM YYYY HH:mm')}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary">{shopName}</Badge>
          <Badge variant="outline">{o.paymentStatus}</Badge>
        </div>

        {/* Address snapshot (opsional) */}
        {o.addressDetail && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div>{o.addressDetail.name} · {o.addressDetail.phone}</div>
            <div>{o.addressDetail.address}</div>
            <div>{o.addressDetail.city} {o.addressDetail.postalCode}</div>
            <div>Shipping: {o.addressDetail.shippingMethod}</div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {o.items.map((it) => {
            const price = it.priceSnapshot ?? 0;
            const subtotal = price * it.qty;

            return (
              <div key={it.id} className="flex items-center gap-3">
                <div className="relative h-16 w-16 rounded bg-muted overflow-hidden">
                  <Image src={firstImage(it.product.images)} alt={it.product.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    <Link href={`/products/${it.product.id}-${it.product.title.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">
                      {it.product.title}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Qty {it.qty} · {formatIDR(price)}
                  </div>
                  <div className="text-xs mt-1">
                    Status: <Badge variant="outline">{it.status}</Badge>
                  </div>
                </div>
                <div className="text-right min-w-[120px]">
                  <div className="font-semibold">{formatIDR(subtotal)}</div>
                  {it.status === 'SHIPPED' && (
                    <Button
                      size="sm"
                      className="mt-1"
                      onClick={() => completeM.mutate(it.id)}
                      disabled={completeM.isPending}
                    >
                      {completeM.isPending ? 'Updating…' : 'Mark Received'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end text-lg font-semibold">
          Total: {formatIDR(o.totalAmount ?? 0)}
        </div>
      </div>
    </div>
  );
}
