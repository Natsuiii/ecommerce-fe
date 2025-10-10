"use client";

import { connection } from 'next/server'
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { loginUser, registerUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthProvider";

const phoneRegex = /^[0-9+\-\s()]{6,20}$/;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE_MB = 3;

// Helper: tipe File
const fileSchema = z.custom<File>((v) => v instanceof File, {
  message: "Invalid file",
});

// Schema akhir: avatar adalah UNION antara File dan undefined
const formSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    phone: z
      .string()
      .transform((val) => val ?? "")
      .refine((val) => val === "" || phoneRegex.test(val), {
        message: "Invalid phone number",
      }),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
    avatar: z
      .union([fileSchema, z.undefined()])
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Avatar must be PNG, JPEG, or WEBP",
      })
      .refine((file) => !file || file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024, {
        message: `Avatar must be <= ${MAX_IMAGE_SIZE_MB}MB`,
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>; // { name, phone, email, password, confirmPassword, avatar: File | undefined }

/* -------------------------------- Page -------------------------------- */

export default async function RegisterPage() {
  await connection()
  const { isLoggedIn } = useAuth();
  const { setTokenAndLoadUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/products";

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);

  if (isLoggedIn) router.push(next);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatar: undefined, // penting: field ada, nilainya bisa undefined
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseURL) throw new Error("API base URL is not configured");

      if (payload.avatar) {
        // Kirim multipart
        const fd = new FormData();
        fd.append("name", payload.name);
        fd.append("email", payload.email);
        fd.append("password", payload.password);
        if (payload.phone) fd.append("phone", payload.phone);
        fd.append("avatar", payload.avatar);

        const res = await fetch(`${baseURL}/api/auth/register`, {
          method: "POST",
          body: fd, // jangan set Content-Type
        });
        if (!res.ok) {
          let msg = "Register failed";
          try {
            const errJson = await res.json();
            msg = errJson?.message || msg;
          } catch {}
          throw new Error(msg);
        }
        return res.json();
      }

      // Fallback JSON (tanpa file)
      return registerUser({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone || undefined,
      } as any);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      loginUser(payload),
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setApiError(null);
    try {
      // 1) Register
      await registerMutation.mutateAsync(values);

      // 2) Auto-login
      const res = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      const token = (res as any)?.data?.token ?? (res as any)?.token;

      if (!token) throw new Error("No token from login response");

      await setTokenAndLoadUser(token);
      router.push(next);
    } catch (err: any) {
      setApiError(err?.message || "Failed to register. Please try again.");
    }
  };

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;

  return (
    <div className="min-h-screen w-full bg-muted/20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">✶</span>
            <h1 className="text-xl font-bold tracking-tight">Shirt</h1>
          </div>
          <CardTitle className="mt-2 text-2xl">Register</CardTitle>
          <CardDescription>
            Just a few steps away from your next favorite purchase
          </CardDescription>
        </CardHeader>

        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Register Failed</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone (optional) */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        placeholder="Number Phone (optional)"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPw ? "text" : "password"}
                          placeholder="Password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        aria-label="Toggle password"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPw2 ? "text" : "password"}
                          placeholder="Confirm Password"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        aria-label="Toggle confirm password"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPw2((v) => !v)}
                      >
                        {showPw2 ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar (optional) */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-medium underline"
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
