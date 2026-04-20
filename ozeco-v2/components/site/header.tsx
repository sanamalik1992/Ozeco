import Link from "next/link";
import { Heart, Search, ShoppingBag, User } from "lucide-react";

const NAV: { href: string; label: string }[] = [
  { href: "/shop", label: "Shop" },
  { href: "/compare", label: "Compare" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4 md:px-10">
        <Link href="/" className="font-display text-2xl font-black tracking-tighter" aria-label="Ozeco home">
          OZECO
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/shop"
            aria-label="Search"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/admin"
            aria-label="Account"
            className="p-2 rounded-full hover:bg-secondary transition-colors hidden sm:inline-flex"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ShoppingBag className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
