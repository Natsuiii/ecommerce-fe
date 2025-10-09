'use client';

import Link from 'next/link';
import { LayoutGrid, Search, ShoppingCart, Store, LogOut, User, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthProvider';
import { useCart } from '@/hooks/useCart';
import { redirect } from 'next/navigation';

const Logo = () => (
  <Link href="/products" className="flex items-center gap-2">
    <span className="text-xl font-bold tracking-tight">✶ Shirt</span>
  </Link>
);

export default function Header() {
  const { isClient, isLoggedIn, user, isLoadingUser, logout } = useAuth();

  const renderSkeletons = () => (
    <>
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
    </>
  );

  const { totalQty } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        <Logo />

        <div className="hidden md:flex flex-1 justify-center items-center gap-4 ml-8">
          <Button variant="outline" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Category
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {isLoggedIn && totalQty > 0 && (
                  <Badge className="absolute -right-2 -top-2 px-2 py-0.5" variant="destructive">
                    {totalQty}
                  </Badge>
                )}
              </Link>
            </Button>

            {(!isClient || (isLoggedIn && isLoadingUser)) && renderSkeletons()}

            {isClient && !isLoggedIn && !isLoadingUser && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}

            {isClient && isLoggedIn && !isLoadingUser && user && (
              <>
                {user.shop ? (
                  <Button variant="outline" className="gap-2" onClick={() => redirect('/seller')}>
                    <Store className="h-4 w-4" />
                    {user.shop.name}
                  </Button>
                ) : (
                  <Button variant="default" className="gap-2" onClick={() => redirect('/seller/activate')}>
                    <Store className="h-4 w-4" />
                    Open Store
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="h-10 px-4">
                      {user.name ?? 'User'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => redirect('/me')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => redirect('/orders')}>
                      <List className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
