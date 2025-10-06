'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatIDR, firstImage } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <Link href={`/products/${p.id}`} prefetch={false}>
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={firstImage(p.images)}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </Link>

      <CardContent className="p-4 space-y-2">
        <Link href={`/products/${p.id}`} className="line-clamp-2 font-medium">
          {p.title}
        </Link>

        <div className="text-sm text-muted-foreground line-clamp-1">
          {p.category?.name ?? '—'}
        </div>

        <div className="font-semibold">{formatIDR(p.price)}</div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-4 w-4 fill-current" />
          <span>{(p.rating ?? 0).toFixed(1)}</span>
          <span>·</span>
          <span>{p.soldCount} Sold</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <BadgeCheck className="h-4 w-4 text-sky-600" />
          <span className="truncate">{p.shop?.name}</span>
        </div>
      </CardContent>
    </Card>
  );
}
