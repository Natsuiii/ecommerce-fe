'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';

import { useAuth } from '@/contexts/AuthProvider';
import { activateSeller } from '@/lib/api';
import type { SellerActivateResponse } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 3;

/** ---- Zod Schemas ---- */
const fileSchema = z.custom<File>((v) => v instanceof File, { message: 'Invalid file' });

const formSchema = z.object({
  name: z.string().min(2, 'Store name is too short'),
  slug: z
    .string()
    .min(2, 'Store domain is too short')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  addressDetail: z.string().min(3, 'Detail address is required'),
  logo: z
    .union([fileSchema, z.undefined()])
    .refine((f) => !f || ACCEPTED_IMAGE_TYPES.includes(f.type), {
      message: 'Logo must be PNG, JPEG, or WEBP',
    })
    .refine((f) => !f || f.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024, {
      message: `Logo must be <= ${MAX_IMAGE_SIZE_MB}MB`,
    }),
});

type FormValues = z.infer<typeof formSchema>;

/** ---- Page ---- */
export default function SellerActivatePage() {
  const router = useRouter();
  const { isClient, isLoggedIn, refreshUser } = useAuth();
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Guard: paksa login dulu
  React.useEffect(() => {
    if (isClient && !isLoggedIn) {
      router.push('/login?next=' + encodeURIComponent('/seller/activate'));
    }
  }, [isClient, isLoggedIn, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      city: '',
      postalCode: '',
      addressDetail: '',
      logo: undefined,
    },
  });

  // Pakai API helper dari lib/api.ts
  const mutation = useMutation<SellerActivateResponse, Error, FormValues>({
    mutationFn: async (values) => {
      const address = [values.addressDetail, values.city, values.postalCode]
        .filter(Boolean)
        .join(', ');

      return activateSeller({
        name: values.name.trim(),
        slug: values.slug.trim(),
        address,
        logoFile: values.logo, // field name mengikuti SellerActivateBody
      });
    },
    onSuccess: async () => {
      await refreshUser();       // supaya AuthContext.user.shop ter-update
      router.push('/seller/shop');
    },
    onError: (e) => setApiError(e.message || 'Failed to activate seller'),
  });

  const onSubmit: SubmitHandler<FormValues> = (v) => {
    setApiError(null);
    mutation.mutate(v);
  };

  const isSubmitting = mutation.isPending;

  return (
    <div className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">✶</span>
            <h1 className="text-xl font-bold tracking-tight">Shirt</h1>
          </div>
          <CardTitle className="mt-2 text-2xl">Open Your Store Today</CardTitle>
          <CardDescription>
            Start selling in minutes and reach thousands of customers instantly
          </CardDescription>
        </CardHeader>

        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Failed</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Store Profile */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">STORE PROFILE</div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Store Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Store Domain" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lowercase, numbers, and hyphens only (e.g. <span className="font-mono">my-shop</span>)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Logo (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Store Address */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">STORE ADDRESS</div>

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Postal Code" inputMode="numeric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Detail Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => history.back()}
          >
            Back
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
