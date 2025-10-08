'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { useAuth } from '@/contexts/AuthProvider';
import { useCart } from '@/hooks/useCart';
import { checkoutOrders } from '@/lib/api';
import type { CheckoutResponse } from '@/lib/types';
import { formatIDR, firstImage } from '@/lib/format';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  address: z.string().min(5),
  shippingMethod: z.string().min(2),
});
type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { data: cart, isLoading, clear } = useCart();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login?next=' + encodeURIComponent('/checkout'));
  }, [isLoggedIn, router]);

  const items = useMemo(() => cart?.groups.flatMap(g => g.items) ?? [], [cart]);
  const grandTotal = cart?.grandTotal ?? 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', city: '', postalCode: '', address: '', shippingMethod: 'JNE REG' },
  });

  async function onSubmit(v: FormValues) {
    if (items.length === 0) return;
    const body = {
      address: {
        name: v.name,
        phone: v.phone,
        city: v.city,
        postalCode: v.postalCode,
        address: v.address,
      },
      shippingMethod: v.shippingMethod,
      selectedItemIds: items.map(i => i.id),
    };

    try {
      const res = await checkoutOrders(body);
      const any = res as any;
      const payload: CheckoutResponse = any?.data ?? any;

      // dapatkan id order pertama yang dibuat
      let firstId: number | undefined;
      if (Array.isArray((payload as any)?.orderIds)) {
        firstId = (payload as any).orderIds[0];
      } else if (Array.isArray((payload as any)?.orders)) {
        firstId = (payload as any).orders[0]?.id;
      } else if (typeof (payload as any)?.id === 'number') {
        firstId = (payload as any).id;
      }

      // kosongkan cart lalu redirect
      await clear();
      router.replace(firstId ? `/orders/${firstId}` : '/orders');
    } catch (e) {
      // TODO: tampilkan toast error kalau mau
      console.error(e);
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-7 rounded-xl border p-4 md:p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Full name" {...form.register('name')} />
              <Input placeholder="Phone" {...form.register('phone')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="City" {...form.register('city')} />
              <Input placeholder="Postal code" {...form.register('postalCode')} />
            </div>
            <Input placeholder="Address" {...form.register('address')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                onValueChange={(v) => form.setValue('shippingMethod', v)}
                value={form.watch('shippingMethod')}
              >
                <SelectTrigger><SelectValue placeholder="Shipping" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="JNE REG">JNE REG</SelectItem>
                  <SelectItem value="JNE YES">JNE YES</SelectItem>
                  <SelectItem value="SiCepat REG">SiCepat REG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={items.length === 0}>Place Order</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/cart">Back to Cart</Link>
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3">Order Summary</h2>
            <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
              {isLoading ? (
                <div className="h-24 bg-muted rounded animate-pulse" />
              ) : items.length === 0 ? (
                <div className="text-sm text-muted-foreground">Your cart is empty.</div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded bg-muted">
                      <Image src={firstImage(it.product.images)} alt={it.product.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{it.product.title}</div>
                      <div className="text-xs text-muted-foreground">x{it.qty}</div>
                    </div>
                    <div className="text-sm font-medium">{formatIDR(it.subtotal)}</div>
                  </div>
                ))
              )}
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Grand Total</div>
              <div className="text-lg font-semibold">{formatIDR(grandTotal)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
