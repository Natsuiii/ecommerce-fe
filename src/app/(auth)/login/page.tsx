'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';

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
import { loginUser } from '@/lib/api'; // Fungsi API yang kita buat sebelumnya

// 1. Definisikan skema validasi form menggunakan Zod
const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

// Definisikan tipe untuk response sukses dari API login
type LoginResponse = {
  token: string;
  // tambahkan properti lain jika ada dari API
};

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  // 2. Setup React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 3. Setup TanStack Query Mutation untuk proses login
  const mutation = useMutation<LoginResponse, Error, z.infer<typeof formSchema>>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Jika sukses, simpan token dan redirect
      localStorage.setItem('authToken', data.token);
      router.push('/products'); // Arahkan ke halaman katalog produk
    },
    onError: (error) => {
      // Jika gagal, tampilkan pesan error dari API
      setApiError(error.message);
    },
  });

  // 4. Buat fungsi handler untuk submit form
  function onSubmit(values: z.infer<typeof formSchema>) {
    setApiError(null); // Reset error setiap kali submit
    mutation.mutate(values); // Panggil API
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="">
          {/* Logo ntar disini */}
          <h1 className="text-2xl font-bold tracking-tight">Shirt</h1>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Access your account and start shopping in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium underline font-bold">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}