import { Search, Menu, X, Heart, GitCompare, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CartDrawer from "@/components/CartDrawer";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { Card } from "@/components/ui/card";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
  const [mobileTypesOpen, setMobileTypesOpen] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }).slice(0, 5) // Limit to 5 results
    : [];

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [searchOpen]);

  const handleProductClick = (slug: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setLocation(`/product/${slug}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      {/* Top bar with phone number for Google Ads compliance */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center md:justify-end gap-2 text-sm">
            <Phone className="h-4 w-4" />
            <a href="tel:03333398590" className="font-medium hover:underline" data-testid="link-header-phone">
              Sales & Support, Call us on <span className="font-bold">0333 339 8590</span>
            </a>
            <span className="hidden md:inline text-xs opacity-90 ml-2">Mon-Fri: 9:00 AM - 5:30 PM (GMT)</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" data-testid="link-home">
            <h1 className="text-2xl font-display font-bold text-primary">Ozeco</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2" 
              data-testid="link-all-bikes"
            >
              All E-Bikes
            </Link>
            
            <div className="relative group">
              <button className="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2" data-testid="button-nav-brands">
                Shop by Brand
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <Card className="p-3 min-w-48 shadow-xl border-2">
                  <div className="px-3 py-2 mb-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brands</h3>
                  </div>
                  <Link 
                    href="/shop?brand=ENGWE" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-brand-engwe"
                  >
                    <span className="font-semibold">ENGWE</span>
                  </Link>
                  <Link 
                    href="/shop?brand=Eleglide" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-brand-eleglide"
                  >
                    <span className="font-semibold">Eleglide</span>
                  </Link>
                  <Link 
                    href="/shop?brand=DYU" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-brand-dyu"
                  >
                    <span className="font-semibold">DYU</span>
                  </Link>
                  <Link 
                    href="/shop?brand=Duotts" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-brand-duotts"
                  >
                    <span className="font-semibold">Duotts</span>
                  </Link>
                  <Link 
                    href="/shop?brand=Touroll" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-brand-touroll"
                  >
                    <span className="font-semibold">Touroll</span>
                  </Link>
                  <Link 
                    href="/shop?brand=Fiido" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-brand-fiido"
                  >
                    <span className="font-semibold">Fiido</span>
                  </Link>
                </Card>
              </div>
            </div>
            
            <div className="relative group">
              <button className="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2" data-testid="button-nav-types">
                Shop by Type
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <Card className="p-3 min-w-48 shadow-xl border-2">
                  <div className="px-3 py-2 mb-1">
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">Types</h3>
                  </div>
                  <Link 
                    href="/shop?category=City" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-type-city"
                  >
                    <span className="font-semibold">City</span>
                  </Link>
                  <Link 
                    href="/shop?category=Folding" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-type-folding"
                  >
                    <span className="font-semibold">Folding</span>
                  </Link>
                  <Link 
                    href="/shop?category=Mountain" 
                    className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-3 py-2 w-full" 
                    data-testid="button-type-mountain"
                  >
                    <span className="font-semibold">Mountain</span>
                  </Link>
                </Card>
              </div>
            </div>
            
            <Link 
              href="/blog" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2" 
              data-testid="link-blog"
            >
              Blog
            </Link>
            <Link 
              href="/about" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2" 
              data-testid="link-about"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2" 
              data-testid="link-contact"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="relative" ref={searchRef}>
                <div className="flex items-center gap-2">
                  <Input
                    type="search"
                    placeholder="Search e-bikes..."
                    className="w-48 md:w-64"
                    data-testid="input-search"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    data-testid="button-close-search"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Search Results Dropdown */}
                {searchQuery && (
                  <Card className="absolute top-full mt-2 w-full md:w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
                    {filteredProducts.length > 0 ? (
                      <div className="p-2">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.slug)}
                            className="w-full p-3 hover-elevate rounded-lg flex items-center gap-3 text-left"
                            data-testid={`search-result-${product.slug}`}
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.brand}</p>
                            </div>
                            <p className="font-bold text-primary">£{product.price}</p>
                          </button>
                        ))}
                        {filteredProducts.length === 5 && (
                          <div className="p-2 text-center">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setLocation(`/shop?search=${searchQuery}`);
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="text-xs"
                            >
                              View all results →
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <p className="text-sm">No products found for "{searchQuery}"</p>
                        <p className="text-xs mt-1">Try searching by brand or bike type</p>
                      </div>
                    )}
                  </Card>
                )}
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

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation('/compare')}
              data-testid="button-compare"
            >
              <GitCompare className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation('/wishlist')}
              data-testid="button-wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <CartDrawer />

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
          <nav className="md:hidden py-4 flex flex-col border-t" data-testid="nav-mobile">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center text-sm font-semibold text-primary uppercase tracking-wide px-4 py-3 w-full justify-start border-b" 
              data-testid="button-mobile-bikes"
              onClick={() => setMobileMenuOpen(false)}
            >
              All E-Bikes
            </Link>
            
            <div className="border-b">
              <button
                onClick={() => setMobileBrandsOpen(!mobileBrandsOpen)}
                className="flex items-center justify-center w-full text-sm font-semibold text-primary uppercase tracking-wide px-4 py-3 relative"
                data-testid="button-mobile-brands-toggle"
              >
                Brands
                <ChevronDown className={`h-4 w-4 transition-transform absolute right-4 ${mobileBrandsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileBrandsOpen && (
                <div className="flex flex-col gap-1 pl-2">
                  <Link 
                    href="/shop?brand=ENGWE" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-brand-engwe"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ENGWE
                  </Link>
                  <Link 
                    href="/shop?brand=Eleglide" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-brand-eleglide"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Eleglide
                  </Link>
                  <Link 
                    href="/shop?brand=DYU" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-brand-dyu"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    DYU
                  </Link>
                  <Link 
                    href="/shop?brand=Duotts" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-brand-duotts"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Duotts
                  </Link>
                  <Link 
                    href="/shop?brand=Touroll" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-brand-touroll"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Touroll
                  </Link>
                  <Link 
                    href="/shop?brand=Fiido" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-brand-fiido"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fiido
                  </Link>
                </div>
              )}
            </div>

            <div className="border-b">
              <button
                onClick={() => setMobileTypesOpen(!mobileTypesOpen)}
                className="flex items-center justify-center w-full text-sm font-semibold text-primary uppercase tracking-wide px-4 py-3 relative"
                data-testid="button-mobile-types-toggle"
              >
                Types
                <ChevronDown className={`h-4 w-4 transition-transform absolute right-4 ${mobileTypesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileTypesOpen && (
                <div className="flex flex-col gap-1 pl-2">
                  <Link 
                    href="/shop?category=City" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-type-city"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    City
                  </Link>
                  <Link 
                    href="/shop?category=Folding" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-type-folding"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Folding
                  </Link>
                  <Link 
                    href="/shop?category=Mountain" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 min-h-9 px-4 py-2 w-full justify-start" 
                    data-testid="button-mobile-type-mountain"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mountain
                  </Link>
                </div>
              )}
            </div>
            
            <Link 
              href="/blog" 
              className="inline-flex items-center justify-center text-sm font-semibold text-primary uppercase tracking-wide px-4 py-3 w-full justify-start border-b" 
              data-testid="button-mobile-blog"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/about" 
              className="inline-flex items-center justify-center text-sm font-semibold text-primary uppercase tracking-wide px-4 py-3 w-full justify-start border-b" 
              data-testid="button-mobile-about"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center text-sm font-semibold text-primary uppercase tracking-wide px-4 py-3 w-full justify-start border-b" 
              data-testid="button-mobile-contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
