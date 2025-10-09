'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSellerShop } from '@/lib/api';
import type { SellerShopResponse } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthProvider';
import StatCard from '@/components/seller/StatCard';
import { Package, FileText, Banknote, BadgeCheck } from 'lucide-react';
import { formatIDR } from '@/lib/format';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { isClient, isLoggedIn } = useAuth();

  // guard: wajib login
  React.useEffect(() => {
    if (isClient && !isLoggedIn) {
      router.replace('/login?next=' + encodeURIComponent('/seller'));
    }
  }, [isClient, isLoggedIn, router]);

  const { data, isLoading, isError, error } = useQuery<SellerShopResponse>({
    queryKey: ['seller-shop'],
    queryFn: getSellerShop,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  const shop = data?.data;
  const totalProducts = shop?._count?.products ?? 0;
  const totalOrders = shop?._count?.orderItems ?? 0;

  // Belum ada endpoint revenue → tampilkan 0 dulu
  const totalRevenue = 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back{shop?.name ? `, ${shop.name}` : ''}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Product" value={shop?._count?.products} icon={Package} />
        <StatCard title="Total Orders" value={shop?._count?.orderItems} icon={FileText} />
        <StatCard title="Total Revenue" value={formatIDR(totalRevenue ?? 0)} icon={Banknote} />
        <StatCard title="Completed Orders" value="-" icon={BadgeCheck} />
      </div>
    </div>
  );
}
