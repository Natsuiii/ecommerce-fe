'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getMe, updateMe } from '@/lib/api';
import type { MeProfile, UpdateMeBody } from '@/lib/types';
import { useAuth } from '@/contexts/AuthProvider';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import * as React from 'react';
import { firstImage } from '@/lib/format';

export default function MePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const qc = useQueryClient();

  // redirect kalau belum login
  useEffect(() => {
    if (!isLoggedIn) router.replace('/login?next=' + encodeURIComponent('/me'));
  }, [isLoggedIn, router]);

  const meQ = useQuery<MeProfile>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await getMe();
      const any = res as any;
      return (any?.data as MeProfile) ?? (any as MeProfile);
    },
    enabled: isLoggedIn,
    staleTime: 60_000,
  });

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<UpdateMeBody>({ name: '', phone: '', avatarUrl: '' });

  React.useEffect(() => {
    if (meQ.data) {
      setForm({
        name: meQ.data.name ?? '',
        phone: meQ.data.phone ?? '',
        avatarUrl: meQ.data.avatarUrl ?? '',
      });
    }
  }, [meQ.data]);

  const updateM = useMutation({
    mutationFn: (body: UpdateMeBody) => updateMe(body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      await qc.invalidateQueries({ queryKey: ['userProfile'] }); // header
      setOpen(false);
    },
  });

  if (!isLoggedIn) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">My Profile</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-start gap-6">
              <AvatarBlock name={meQ.data?.name} avatarUrl={meQ.data?.avatarUrl} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Field label="Name" value={meQ.data?.name} />
                <Field label="Email" value={meQ.data?.email} />
                <Field label="Phone" value={meQ.data?.phone || '-'} />
                <Field label="Store" value={meQ.data?.shop?.name || '—'} />
              </div>
              <div className="md:ml-auto">
                <Button onClick={() => setOpen(true)}>Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Orders" value={meQ.data?.stats?.orders ?? meQ.data?.stats?.totalOrders ?? 0} />
                <Stat label="Completed Items" value={meQ.data?.stats?.completedItems ?? 0} />
                <Stat label="Has Store" value={meQ.data?.stats?.hasShop ? 'Yes' : 'No'} />
                <Stat label="Total Spend" value={formatMaybeIDR(meQ.data?.stats?.totalSpend)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Ubah data dasar akunmu.
              </div>
              <Button onClick={() => setOpen(true)}>Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="avatarUrl">Avatar URL (opsional)</Label>
              <Input id="avatarUrl" value={form.avatarUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} />
              {!!form.avatarUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative h-14 w-14 rounded bg-muted overflow-hidden">
                    <Image src={firstImage([form.avatarUrl])} alt="avatar" fill className="object-cover" />
                  </div>
                  <Badge variant="outline">Preview</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => updateM.mutate(form)}
              disabled={updateM.isPending}
            >
              {updateM.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- little UI helpers ---------- */
function AvatarBlock({ name, avatarUrl }: { name?: string; avatarUrl?: string | null }) {
  const initials = (name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 rounded-full bg-muted overflow-hidden grid place-items-center">
        {avatarUrl ? (
          <Image src={firstImage([avatarUrl])} alt={name ?? 'User'} fill className="object-cover" />
        ) : (
          <span className="font-semibold">{initials}</span>
        )}
      </div>
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-muted-foreground">Member</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value ?? 0}</div>
    </div>
  );
}

function formatMaybeIDR(n?: number) {
  if (typeof n !== 'number') return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}
