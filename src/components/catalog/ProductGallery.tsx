'use client';

import * as React from 'react';
import Image from 'next/image';
import { firstImage } from '@/lib/format';

export default function ProductGallery({ images }: { images?: string[] }) {
  const valid = (images ?? []).filter((u) => !!u);
  const fallback = ['/placeholder.png'];
  const imgs = valid.length ? valid : fallback;
  const [idx, setIdx] = React.useState(0);

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
        <Image
          src={firstImage([imgs[idx]])}
          alt={`image-${idx}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* thumbnails */}
      {imgs.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`relative aspect-square overflow-hidden rounded-md border ${
                i === idx ? 'ring-2 ring-ring' : ''
              }`}
            >
              <Image
                src={firstImage([src])}
                alt={`thumb-${i}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
