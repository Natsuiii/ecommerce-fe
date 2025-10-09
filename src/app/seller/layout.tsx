'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Package, ClipboardList, MessageSquare, Settings } from 'lucide-react';

import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Order List', icon: ClipboardList },
  { href: '/seller/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/seller/settings', label: 'Settings', icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isClient, isLoggedIn, user, logout } = useAuth();

  // guard: wajib login
  React.useEffect(() => {
    if (isClient && !isLoggedIn) {
      router.replace('/login?next=' + encodeURIComponent('/seller'));
    }
  }, [isClient, isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="grid grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-screen sticky top-0 border-r bg-background">
          <div className="px-4 py-4 flex items-center gap-2 border-b">
            <span className="text-lg">✶</span>
            <div className="leading-tight">
              <div className="font-semibold">Shirt</div>
              <div className="text-xs text-muted-foreground">Seller</div>
            </div>
          </div>

          <nav className="px-2 py-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
                    active && 'bg-muted font-medium'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-3 left-0 right-0 px-3">
            <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-h-screen">
          {/* Topbar */}
          <div className="h-14 border-b bg-background flex items-center justify-between px-4">
            <div className="font-semibold">Dashboard</div>
            <div className="flex items-center gap-3">
              <div className="text-sm">{user?.name}</div>
            </div>
          </div>

          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
