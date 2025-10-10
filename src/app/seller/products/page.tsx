"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { getSellerProducts } from "@/lib/api";
import type { SellerProductsResponse } from "@/lib/types";
import { formatIDR } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function useQueryState() {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const isActive = sp.get("isActive") ?? ""; // '', 'true', 'false'
  const page = Number(sp.get("page") ?? "1");
  const limit = Number(sp.get("limit") ?? "10");

  const set = React.useCallback(
    (
      next: Partial<{
        q: string;
        isActive: string;
        page: number;
        limit: number;
      }>
    ) => {
      const params = new URLSearchParams(sp.toString());
      if (next.q !== undefined) params.set("q", next.q);
      if (next.isActive !== undefined) params.set("isActive", next.isActive);
      if (next.page !== undefined) params.set("page", String(next.page));
      if (next.limit !== undefined) params.set("limit", String(next.limit));
      router.replace(`/seller/products?${params.toString()}`);
    },
    [router, sp]
  );

  return { q, isActive, page, limit, set };
}

function EmptyState() {
  return (
    <div className="py-12 text-center text-sm text-muted-foreground">
      Belum ada produk. Klik{" "}
      <Link href="/seller/products/new" className="underline">
        Add Product
      </Link>{" "}
      untuk membuat produk pertama.
    </div>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function SellerProductsPage() {
  const { q, isActive, page, limit, set } = useQueryState();
  const [search, setSearch] = React.useState(q);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const normalized = search.trim();
      if (normalized === (q ?? "").trim()) return;
      set({ q: normalized, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [search, q, set]);

  const { data, isLoading } = useQuery<SellerProductsResponse>({
    queryKey: ["seller-products", { q, isActive, page, limit }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (isActive) params.set("isActive", isActive);
      params.set("page", String(page));
      params.set("limit", String(limit));
      return getSellerProducts(params);
    },
  });

  const list = data?.data.products ?? [];
  const pagination = data?.data.pagination ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  }; // ✅ benar

  const selectStatusValue = isActive ? isActive : "all";
  const startNo = (pagination.page - 1) * pagination.limit;

  const from = list.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = (pagination.page - 1) * pagination.limit + list.length;

  // buat window halaman untuk pagination (1 … p-1 p p+1 … total)
  const pages: (number | "...")[] = [];
  const totalPages = pagination.totalPages || 1;
  const cur = pagination.page || 1;

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (cur > 3) pages.push("...");
    const start = Math.max(2, cur - 1);
    const end = Math.min(totalPages - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="px-4 py-6 md:py-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3">
          <h1 className="text-xl font-semibold">Products</h1>

          <div className="flex w-full items-center gap-2 sm:w-auto flex-col justify-between sm:flex-row">
            <Link href="/seller/products/new">
              <Button className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">List Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="\text-center">No</TableHead>
                    <TableHead>Product Info</TableHead>
                    <TableHead className="">Price</TableHead>
                    <TableHead className="">Stock</TableHead>
                    <TableHead className="">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  ) : (
                    list.map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {startNo + idx + 1}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted">
                              {p.images?.[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <div>
                              <div className="font-medium leading-5">
                                {p.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {p.category?.name ?? "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{formatIDR(p.price)}</TableCell>
                        <TableCell>{p.stock}</TableCell>

                        <TableCell className="">
                          <div className="flex gap-3 text-muted-foreground">
                            <Link
                              href={`/seller/products/${p.id}`}
                              title="Detail"
                            >
                              <Eye className="h-4 w-4 hover:text-foreground" />
                            </Link>
                            <Link
                              href={`/seller/products/${p.id}/edit`}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4 hover:text-foreground" />
                            </Link>
                            <button
                              type="button"
                              title="Delete"
                              className="text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                  {list.length ? startNo + 1 : 0}–{startNo + list.length}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                entries
              </div>

              <div className="flex items-center gap-2">
                <Pagination className="m-0">
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        className="h-8 px-3 rounded-md hover:bg-muted"
                        onClick={() => cur > 1 && set({ page: cur - 1 })}
                      />
                    </PaginationItem>

                    {pages.map((p, i) =>
                      p === "..." ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            className="h-8 w-8 rounded-md"
                            isActive={p === cur}
                            onClick={() => set({ page: p })}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        className="h-8 px-3 rounded-md hover:bg-muted"
                        onClick={() =>
                          cur < totalPages && set({ page: cur + 1 })
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
