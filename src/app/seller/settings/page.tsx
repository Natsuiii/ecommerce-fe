// src/app/seller/settings/page.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { BadgeCheck, Building2, ImageIcon } from 'lucide-react';

import { useAuth } from '@/contexts/AuthProvider';
import { getSellerShop, updateMyShop } from '@/lib/api';
import type { SellerShopResponse, UpdateShopBody } from '@/lib/types';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;

/* ------------------------------ form schema ------------------------------ */
const fileSchema = z.custom<File>((v) => v instanceof File, { message: 'Invalid file' });
const formSchema = z.object({
  name: z.string().min(2, 'Store name is too short').optional(),
  address: z.string().min(3, 'Address is too short').optional(),
  isActive: z.boolean().optional(),
  logo: z
    .union([fileSchema, z.undefined(), z.null()])
    .refine((f) => !f || ACCEPTED_IMAGE_TYPES.includes(f.type), {
      message: 'Logo must be PNG, JPEG, or WEBP',
    })
    .refine((f) => !f || f.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024, {
      message: `Logo must be <= ${MAX_IMAGE_SIZE_MB}MB`,
    })
    .optional(),
});
type FormValues = z.infer<typeof formSchema>;

/* --------------------------------- page ---------------------------------- */
export default function SellerSettingsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { isClient, isLoggedIn } = useAuth();

  // Auth guard
  React.useEffect(() => {
    if (isClient && !isLoggedIn) {
      router.push('/login?next=' + encodeURIComponent('/seller/settings'));
    }
  }, [isClient, isLoggedIn, router]);

  // Fetch shop
  const { data, isLoading, isError, error } = useQuery<SellerShopResponse>({
    queryKey: ['seller', 'shop'],
    queryFn: getSellerShop,
    enabled: isLoggedIn,
  });
  const shop = data?.data;

  // Dialog state
  const [open, setOpen] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: shop?.name ?? '',
      address: shop?.address ?? '',
      isActive: !!shop?.isActive,
      logo: undefined,
    },
  });

  // open dialog with current values when shop loaded
  React.useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name ?? '',
        address: shop.address ?? '',
        isActive: !!shop.isActive,
        logo: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop?.id]); // reset once when shop changes

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload : UpdateShopBody = {
        name: values.name?.trim() || undefined,
        address: values.address?.trim() || undefined,
        isActive: values.isActive,
        logoFile: values.logo || undefined,
      };
      return updateMyShop(payload);
    },
    onSuccess: async () => {
      setApiError(null);
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['seller', 'shop'] });
    },
    onError: (e: any) => {
      setApiError(e?.message || 'Update failed');
    },
  });

  const onSubmit = (values: FormValues) => {
    setApiError(null);
    mutation.mutate(values);
  };

  const domain = shop?.slug ? `www.shirt.com/${shop.slug}` : '—';

  return (
    <div className="min-h-screen w-full bg-muted/20 px-4 lg:px-8 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <Card className="w-[30%]">
                <CardHeader>
                  <CardTitle className="text-base">Store Profile</CardTitle>
                  <CardDescription>Basic info for your storefront</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : isError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Failed to load</AlertTitle>
                      <AlertDescription>{(error as any)?.message ?? 'Error'}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex flex-col items-start gap-4">
                        <div className="h-24 w-24 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                          {shop?.logo ? (
                            <Image
                              src={shop.logo}
                              alt={shop.name}
                              width={56}
                              height={56}
                              className="h-24 w-24 object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1 flex flex-col gap-2">
                          <div>
                            <div className="text-sm text-muted-foreground">Store Name</div>
                            <div className="font-medium">{shop?.name || '—'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Store Domain</div>
                            <div className="font-medium">{domain}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setOpen(true)} className='w-full bg-transparent border border-muted[.6] text-black dark:text-white hover:text-white'>Change Profile</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="mt-0">
              <Card className="w-[30%]">
                <CardHeader>
                  <CardTitle className="text-base">Address</CardTitle>
                  <CardDescription>Where you ship products from</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : isError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Failed to load</AlertTitle>
                      <AlertDescription>{(error as any)?.message ?? 'Error'}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Store Address</div>
                        <div className="font-medium">{shop?.address || '—'}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setOpen(true)} className='w-full bg-transparent border border-muted[.6] text-black dark:text-white hover:text-white'>Change Address</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ------------------------------- dialog ------------------------------ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
          </DialogHeader>

          {apiError && (
            <Alert variant="destructive" className="mb-2">
              <AlertTitle>Update failed</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name</Label>
              <Input id="name" placeholder="Your store name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Full address" {...form.register('address')} />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo (PNG/JPG/WEBP ≤ {MAX_IMAGE_SIZE_MB}MB)</Label>
              <Controller
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <Input
                    id="logo"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                  />
                )}
              />
              {form.formState.errors.logo && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.logo.message as string}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <div className="font-medium flex items-center gap-2">
                  Active Store
                  <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Toggle to activate/deactivate your storefront.
                </p>
              </div>
              <Controller
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} aria-busy={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
