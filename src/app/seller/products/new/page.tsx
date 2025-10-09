'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

import { createSellerProduct, getCategories } from '@/lib/api';
import type { Category, CreateProductResponse } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGES = 5;

const fileSchema = z.custom<File>((v) => v instanceof File, { message: 'Invalid file' });

const formSchema = z.object({
  title: z.string().min(2, 'Product name is too short'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.string().min(1, 'Price is required').refine((v) => /^\d+$/.test(v), 'Price must be a number'),
  stock: z.string().min(1, 'Stock is required').refine((v) => /^\d+$/.test(v), 'Stock must be a number'),
  description: z.string().optional(),
  images: z
    .array(z.union([fileSchema, z.undefined()]))
    .max(MAX_IMAGES, `Max ${MAX_IMAGES} photos`)
    .refine((arr) => arr.filter(Boolean).length >= 1, 'At least one photo is required')
    .refine(
      (arr) => arr.filter(Boolean).every((f) => f && ACCEPTED_IMAGE_TYPES.includes(f.type)),
      'Photos must be PNG, JPG, or WEBP',
    )
    .refine(
      (arr) => arr.filter(Boolean).every((f) => f && f.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024),
      `Each photo must be ≤ ${MAX_IMAGE_SIZE_MB}MB`,
    ),
});

type FormValues = z.infer<typeof formSchema>;


export default function AddProductPage() {
  const router = useRouter();

  // Categories
  const { data: catRes } = useQuery({
  queryKey: ['categories'],
  queryFn: getCategories, // return { success, message?, data: Category[] }
});
const categories = catRes?.data.categories ?? [];

  // RHF
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      price: '',
      stock: '',
      description: '',
      images: [],
    },
  });

  // Mutation: create product (multipart)
  const mutation = useMutation<CreateProductResponse, Error, FormValues>({
    mutationFn: async (values) => {
      const files = (values.images ?? []).filter(Boolean) as File[];

      const fd = new FormData();
      fd.append('title', values.title.trim());
      fd.append('description', (values.description ?? '').trim());
      fd.append('price', String(parseInt(values.price, 10)));
      fd.append('stock', String(parseInt(values.stock, 10)));
      fd.append('categoryId', String(parseInt(values.categoryId, 10)));
      files.forEach((file) => fd.append('images', file));

      return createSellerProduct(fd);
    },
    onSuccess: () => {
      toast.success('Successfully created product', {
        description: 'You have successfully created a product',
        duration: 5000,
      });
      form.reset({
        title: '',
        categoryId: '',
        price: '',
        stock: '',
        description: '',
        images: [],
      });
    },
    onError: (err) => {
      toast.error('Failed to create product', {
        description: err.message ?? 'Something went wrong',
        duration: 5000,
      });
    },
  });

  const isSubmitting = mutation.isPending;


  const setImageAt = (idx: number, file?: File) => {
    const current = form.getValues('images') ?? [];
    const next = [...current];
    next[idx] = file as any; // allow undefined
    form.setValue('images', next, { shouldValidate: true });
  };

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="px-4 py-6 md:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-semibold">Add Product</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Product name */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input inputMode="numeric" placeholder="Price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input inputMode="numeric" placeholder="Stock" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Description" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photos */}
                <Controller
                  control={form.control}
                  name="images"
                  render={() => (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Photo Product</div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
                          const current = form.watch('images') ?? [];
                          const file = current[idx];

                          return (
                            <label
                              key={idx}
                              className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-3 text-center hover:bg-muted/40"
                            >
                              <input
                                type="file"
                                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                className="hidden"
                                onChange={(e) => setImageAt(idx, e.target.files?.[0])}
                              />
                              <ImagePlus className="mb-2 h-5 w-5" />
                              <span className="text-xs text-muted-foreground">
                                {file ? file.name : `Photo ${idx + 1}`}
                              </span>
                              {file && (
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="mt-1 h-auto p-0 text-xs"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setImageAt(idx, undefined);
                                  }}
                                >
                                  Remove
                                </Button>
                              )}
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage>{form.formState.errors.images?.message as any}</FormMessage>
                    </div>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
