'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus } from 'lucide-react';

import { useAuth } from '@/contexts/AuthProvider';
import { useCart } from '@/hooks/useCart';
import { formatIDR, firstImage } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { data, isLoading, totalQty, updateItem, removeItem, clear } = useCart();

  // redirect kalau belum login
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLoggedIn) router.replace('/login?next=' + encodeURIComponent('/cart'));
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const empty = !isLoading && (totalQty === 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Shopping Cart</h1>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded bg-muted" />
      ) : empty ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Cart is empty. <Link href="/products" className="underline">Browse products</Link>
        </div>
      ) : (
        <>
          {/* groups by shop */}
          <div className="space-y-6">
            {data?.groups.map((g) => (
              <div key={g.shop.id} className="rounded-xl border">
                <div className="px-4 py-3 flex items-center justify-between">
                  <Link href={`/stores/${g.shop.slug ?? g.shop.id}`} className="font-semibold hover:underline">
                    {g.shop.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">Subtotal: {formatIDR(g.subtotal)}</div>
                </div>
                <Separator />
                <div className="p-4 space-y-4">
                  {g.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                        <Image src={firstImage(it.product.images)} alt={it.product.title} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${it.product.id}-${it.product.slug ?? ''}`} className="font-medium line-clamp-1 hover:underline">
                          {it.product.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">{formatIDR(it.priceSnapshot)}</div>
                      </div>

                      {/* qty */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => updateItem(it.id, Math.max(1, it.qty - 1))}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          value={it.qty}
                          onChange={(e) => {
                            const v = parseInt(e.target.value || '1', 10);
                            updateItem(it.id, Number.isNaN(v) ? 1 : Math.max(1, v));
                          }}
                          className="w-14 text-center"
                          inputMode="numeric"
                        />
                        <Button variant="outline" size="icon" onClick={() => updateItem(it.id, it.qty + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* subtotal + remove */}
                      <div className="text-right min-w-[120px]">
                        <div className="font-semibold">{formatIDR(it.subtotal)}</div>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(it.id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-8 rounded-xl border p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Items</div>
              <div className="font-medium">{totalQty}</div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">Grand Total</div>
              <div className="text-xl font-semibold">{formatIDR(data?.grandTotal ?? 0)}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => clear()}>Clear Cart</Button>
              <Button
                onClick={() => router.push('/checkout')}
                disabled={totalQty === 0}
              >
                Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
