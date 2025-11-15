import { Search, Menu, X, Heart, GitCompare } from "lucide-react";
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" data-testid="link-home">
            <h1 className="text-2xl font-display font-bold text-primary">Ozeco</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop" data-testid="link-all-bikes">
              <Button variant="ghost" data-testid="button-nav-bikes">All E-Bikes</Button>
            </Link>
            <Link href="/blog" data-testid="link-blog">
              <Button variant="ghost" data-testid="button-nav-blog">Blog</Button>
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
                              variant="link"
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

            <Link href="/compare">
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-compare"
              >
                <GitCompare className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/wishlist">
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-wishlist"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

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
          <nav className="md:hidden py-4 flex flex-col gap-2" data-testid="nav-mobile">
            <Link href="/shop">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-bikes">
                All E-Bikes
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-blog">
                Blog
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
