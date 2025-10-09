// ClientShell.tsx
'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname === '/login' || pathname === '/register'
  const isSeller = pathname.startsWith('/seller') // ⬅️ sembunyikan semua /seller/*
  const hideChrome = isAuth || isSeller

  return (
    <>
      {!hideChrome && <Header />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
    </>
  )
}
