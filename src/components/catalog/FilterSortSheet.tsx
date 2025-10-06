'use client';

import * as React from 'react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

export type SortKey = 'price' | 'rating' | 'newest' | 'popular';
export type OrderKey = 'asc' | 'desc';

type PresetKey =
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'rating_asc'
  | 'popular_desc'
  | 'newest_desc'
  | 'oldest_asc';

const presetToPair: Record<PresetKey, { sort: SortKey; order: OrderKey }> = {
  price_asc:     { sort: 'price',   order: 'asc'  },
  price_desc:    { sort: 'price',   order: 'desc' },
  rating_desc:   { sort: 'rating',  order: 'desc' },
  rating_asc:    { sort: 'rating',  order: 'asc'  },
  popular_desc:  { sort: 'popular', order: 'desc' },
  newest_desc:   { sort: 'newest',  order: 'desc' },
  oldest_asc:    { sort: 'newest',  order: 'asc'  },
};

function pairToPreset(sort: SortKey, order: OrderKey): PresetKey {
  const hit = Object.entries(presetToPair).find(([, v]) => v.sort === sort && v.order === order);
  return (hit?.[0] as PresetKey) ?? 'newest_desc';
}

export default function FilterSortSheet({
  sort,
  order,
  onApply,
}: {
  sort: SortKey;
  order: OrderKey;
  onApply: (next: { sort: SortKey; order: OrderKey }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [preset, setPreset] = React.useState<PresetKey>(pairToPreset(sort, order));

  React.useEffect(() => setPreset(pairToPreset(sort, order)), [sort, order]);

  const handleApply = () => {
    const next = presetToPair[preset];
    onApply(next);
    setOpen(false);
  };

  const handleReset = () => {
    setPreset('newest_desc');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>Filter & Sort</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 ml-5 mr-5">
          <div>
            <h4 className="text-sm font-semibold">Sort by</h4>
            <p className="text-xs text-muted-foreground">Pilih urutan tampilan</p>

            <Separator className="my-3" />

            <RadioGroup value={preset} onValueChange={(v) => setPreset(v as PresetKey)} className="space-y-3">
              <Option value="newest_desc" label="Newest" hint="Terbaru" />
              <Option value="oldest_asc" label="Oldest" hint="Terlama" />
              <Option value="popular_desc" label="Popular" hint="Terlaris / paling ramai" />
              <Option value="rating_desc" label="Rating: High → Low" />
              <Option value="rating_asc" label="Rating: Low → High" />
              <Option value="price_asc" label="Price: Low → High" />
              <Option value="price_desc" label="Price: High → Low" />
            </RadioGroup>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="ghost" onClick={handleReset}>Reset</Button>
          <Button onClick={handleApply}>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Option({ value, label, hint }: { value: PresetKey; label: string; hint?: string }) {
  const id = `opt-${value}`;
  return (
    <div className="flex items-start gap-3">
      <RadioGroupItem id={id} value={value} />
      <Label htmlFor={id} className="leading-tight">
        {label}
        {hint ? <div className="text-[11px] text-muted-foreground">{hint}</div> : null}
      </Label>
    </div>
  );
}
