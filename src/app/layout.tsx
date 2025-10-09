import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/../components/Providers';
import { ThemeProvider } from '@/../components/ThemeProvider';
import ClientShell from './clientShell';
import { Toaster } from '@/components/ui/sonner' // dari shadcn component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shirt E-commerce',
  description: 'Your favorite online store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster richColors position="top-center" /> 
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ClientShell>{children}</ClientShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
