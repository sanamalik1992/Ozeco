import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" data-testid="link-home">
            <h1 className="text-2xl font-display font-bold text-primary">Ozeco</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/bikes" data-testid="link-all-bikes">
              <Button variant="ghost" data-testid="button-nav-bikes">All E-Bikes</Button>
            </Link>
            <Link href="/brands" data-testid="link-brands">
              <Button variant="ghost" data-testid="button-nav-brands">Brands</Button>
            </Link>
            <Link href="/about" data-testid="link-about">
              <Button variant="ghost" data-testid="button-nav-about">About</Button>
            </Link>
            <Link href="/contact" data-testid="link-contact">
              <Button variant="ghost" data-testid="button-nav-contact">Contact</Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search e-bikes..."
                  className="w-48"
                  data-testid="input-search"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSearchOpen(false)}
                  data-testid="button-close-search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                data-testid="button-open-search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            <Button size="icon" variant="ghost" className="relative" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" data-testid="badge-cart-count">
                2
              </Badge>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 flex flex-col gap-2" data-testid="nav-mobile">
            <Link href="/bikes">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-bikes">
                All E-Bikes
              </Button>
            </Link>
            <Link href="/brands">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-brands">
                Brands
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-about">
                About
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-contact">
                Contact
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
