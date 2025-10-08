'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCart, addCartItem, updateCartItem, removeCartItem, clearCart
} from '@/lib/api';
import {
  type CartResponse, type CartItemPayload, type CartItem
} from '@/lib/types';
import { useAuth } from '@/contexts/AuthProvider';

const KEY = ['cart'];

export function useCart() {
  const qc = useQueryClient();
  const { isLoggedIn } = useAuth();

  // ----- QUERY -----
  const cartQ = useQuery<CartResponse>({
    queryKey: KEY,
    queryFn: async () => {
      const res = await getCart();
      const any = res as any;
      return (any?.data as CartResponse) ?? (any as CartResponse);
    },
    enabled: isLoggedIn,      
    staleTime: 30_000,
  });

  const computeTotalQty = (c?: CartResponse) =>
    c?.groups?.reduce((sum, g) => sum + g.items.reduce((s, i) => s + i.qty, 0), 0) ?? 0;

  const setCart = (updater: (old?: CartResponse) => CartResponse | undefined) =>
    qc.setQueryData<CartResponse>(KEY, updater as any);


  // add / merge qty
  const addM = useMutation({
    mutationFn: (body: CartItemPayload) => addCartItem(body),
    onMutate: async ({ productId, qty }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<CartResponse>(KEY);

      // naive optimistic: cari item di semua grup, jika ketemu tambahkan qty
      const next = structuredClone(prev ?? { groups: [], grandTotal: 0 }) as CartResponse;
      let found: CartItem | undefined;

      for (const g of next.groups) {
        const it = g.items.find(i => i.productId === productId);
        if (it) { it.qty += qty; it.subtotal = it.qty * it.price; found = it; }
        g.subtotal = g.items.reduce((s, i) => s + i.subtotal, 0);
      }
      if (found) next.grandTotal = next.groups.reduce((s, g) => s + g.subtotal, 0);

      setCart(() => next);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && setCart(() => ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const updateM = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: number; qty: number }) => updateCartItem(itemId, qty),
    onMutate: async ({ itemId, qty }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<CartResponse>(KEY);
      const next = structuredClone(prev) as CartResponse | undefined;
      if (next) {
        for (const g of next.groups) {
          const it = g.items.find(i => i.id === itemId);
          if (it) { it.qty = qty; it.subtotal = it.qty * it.price; }
          g.subtotal = g.items.reduce((s, i) => s + i.subtotal, 0);
        }
        next.grandTotal = next.groups.reduce((s, g) => s + g.subtotal, 0);
        setCart(() => next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && setCart(() => ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const removeM = useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<CartResponse>(KEY);
      const next = structuredClone(prev) as CartResponse | undefined;
      if (next) {
        for (const g of next.groups) {
          g.items = g.items.filter(i => i.id !== itemId);
          g.subtotal = g.items.reduce((s, i) => s + i.subtotal, 0);
        }
        next.groups = next.groups.filter(g => g.items.length > 0);
        next.grandTotal = next.groups.reduce((s, g) => s + g.subtotal, 0);
        setCart(() => next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && setCart(() => ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const clearM = useMutation({
    mutationFn: () => clearCart(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<CartResponse>(KEY);
      setCart(() => ({ groups: [], grandTotal: 0 }));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && setCart(() => ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    ...cartQ,
    totalQty: computeTotalQty(cartQ.data),
    addItem: (productId: number, qty = 1) => addM.mutate({ productId, qty }),
    updateItem: (itemId: number, qty: number) => updateM.mutate({ itemId, qty }),
    removeItem: (itemId: number) => removeM.mutate(itemId),
    clear: () => clearM.mutate(),
    isAdding: addM.isPending,
    isUpdating: updateM.isPending,
    isRemoving: removeM.isPending,
    isClearing: clearM.isPending,
  };
}
