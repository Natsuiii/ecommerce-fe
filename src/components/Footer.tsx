'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Music2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      {/* Top */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand + about + socials */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">✶</span>
              <span className="text-xl font-bold tracking-tight">Shirt</span>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              Explore a realm of style with our fashion e-commerce platform, where shopping is effortless.
              Experience a smooth journey with an extensive selection of trendy apparel, all delivered
              directly to your home.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold mb-3">Follow on Social Media</p>
              <div className="flex items-center gap-3">
                <SocialIcon href="#" label="Facebook">
                  <Facebook className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="Instagram">
                  <Instagram className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </SocialIcon>
                <SocialIcon href="#" label="Music">
                  <Music2 className="h-4 w-4" />
                </SocialIcon>
              </div>
            </div>
          </div>

          {/* E-Commerce */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide">E-Commerce</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><FooterLink href="#">About Us</FooterLink></li>
              <li><FooterLink href="#">Terms &amp; Condition</FooterLink></li>
              <li><FooterLink href="#">Privacy Policy</FooterLink></li>
              <li><FooterLink href="#">Blog</FooterLink></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide">Help</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><FooterLink href="#">How to Transact</FooterLink></li>
              <li><FooterLink href="#">Payment Method</FooterLink></li>
              <li><FooterLink href="#">How to Register</FooterLink></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shirt. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link className="hover:text-foreground transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-foreground transition-colors" href="#">Terms</Link>
            <Link className="hover:text-foreground transition-colors" href="#">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Helpers */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-foreground transition-colors">
      {children}
    </Link>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent hover:text-accent-foreground transition"
    >
      {children}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
