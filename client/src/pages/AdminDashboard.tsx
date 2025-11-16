import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Product, type NewsletterSubscriber, type ProductVariant } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Search, Package, TrendingUp, DollarSign, ShoppingBag, Mail, ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminOrders from "./AdminOrders";

interface ProductVariantsProps {
  productId: string;
  onUpdateVariant: (variantId: string, price?: string, stock?: string) => void;
  editingVariantPrice: { [key: string]: string };
  editingVariantStock: { [key: string]: string };
  setEditingVariantPrice: (state: { [key: string]: string }) => void;
  setEditingVariantStock: (state: { [key: string]: string }) => void;
  isPending: boolean;
}

function ProductVariants({ productId, onUpdateVariant, editingVariantPrice, editingVariantStock, setEditingVariantPrice, setEditingVariantStock, isPending }: ProductVariantsProps) {
  const { data: variants = [], isLoading } = useQuery<ProductVariant[]>({
    queryKey: ["/api/products", productId, "variants"],
  });

  if (isLoading) {
    return (
      <div className="p-4 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading variants...</span>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No variants configured for this product
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50">
      <h4 className="text-sm font-medium mb-3">Product Variants</h4>
      <div className="space-y-2">
        {variants.map((variant) => (
          <Card key={variant.id} className="p-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Badge variant="outline" className="mb-1" data-testid={`badge-variant-type-${variant.id}`}>{variant.name}</Badge>
                <p className="text-sm font-medium" data-testid={`text-variant-value-${variant.id}`}>{variant.value}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Price</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium" data-testid={`text-variant-price-${variant.id}`}>£{variant.price}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="New price"
                      value={editingVariantPrice[variant.id] || ""}
                      onChange={(e) => setEditingVariantPrice({ ...editingVariantPrice, [variant.id]: e.target.value })}
                      className="w-24 text-sm"
                      data-testid={`input-variant-price-${variant.id}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateVariant(variant.id, editingVariantPrice[variant.id])}
                      disabled={!editingVariantPrice[variant.id] || isPending}
                      data-testid={`button-update-variant-price-${variant.id}`}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Stock</Label>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium" data-testid={`text-variant-stock-${variant.id}`}>{variant.stockQuantity}</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Qty"
                      value={editingVariantStock[variant.id] || ""}
                      onChange={(e) => setEditingVariantStock({ ...editingVariantStock, [variant.id]: e.target.value })}
                      className="w-20 text-sm"
                      data-testid={`input-variant-stock-${variant.id}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateVariant(variant.id, undefined, editingVariantStock[variant.id])}
                      disabled={!editingVariantStock[variant.id] || isPending}
                      data-testid={`button-update-variant-stock-${variant.id}`}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPrice, setEditingPrice] = useState<{ [key: string]: string }>({});
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>({});
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [editingVariantPrice, setEditingVariantPrice] = useState<{ [key: string]: string }>({});
  const [editingVariantStock, setEditingVariantStock] = useState<{ [key: string]: string }>({});

  // Check if admin is authenticated
  const { data: authCheck, isLoading: authLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch newsletter subscribers
  const { data: newsletterSubscribers = [], isLoading: subscribersLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter/subscribers"],
    enabled: authCheck?.authenticated === true,
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const response = await apiRequest("PATCH", `/api/admin/products/${id}`, updates);
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "Changes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductVariant> }) => {
      const response = await apiRequest("PATCH", `/api/admin/variants/${id}`, updates);
      if (!response.ok) throw new Error("Failed to update variant");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) &&
          query.queryKey.length >= 3 &&
          query.queryKey[0] === "/api/products" &&
          query.queryKey[2] === "variants"
      });
      toast({
        title: "Variant updated",
        description: "Changes saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update variant",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && authCheck && !authCheck.authenticated) {
      setLocation("/admin/login");
    }
  }, [authCheck, authLoading, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleStockToggle = (productId: string, currentValue: boolean) => {
    updateProductMutation.mutate({
      id: productId,
      updates: { inStock: !currentValue },
    });
  };

  const handleBestsellerToggle = (productId: string, currentValue: boolean) => {
    updateProductMutation.mutate({
      id: productId,
      updates: { isBestseller: !currentValue },
    });
  };

  const handleStockQuantityUpdate = (productId: string) => {
    const newQuantity = editingStock[productId];
    if (newQuantity && !isNaN(parseInt(newQuantity))) {
      const quantity = parseInt(newQuantity);
      updateProductMutation.mutate({
        id: productId,
        updates: { 
          stockQuantity: quantity,
          // Auto-set inStock to false if quantity is 0
          ...(quantity === 0 && { inStock: false })
        },
      });
      setEditingStock({ ...editingStock, [productId]: "" });
    }
  };

  const handlePriceUpdate = (productId: string) => {
    const newPrice = editingPrice[productId];
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      updateProductMutation.mutate({
        id: productId,
        updates: { price: newPrice },
      });
      setEditingPrice({ ...editingPrice, [productId]: "" });
    }
  };

  const handleVariantUpdate = (variantId: string, price?: string, stock?: string) => {
    const updates: Partial<ProductVariant> = {};
    
    if (price && !isNaN(parseFloat(price))) {
      updates.price = price;
      setEditingVariantPrice({ ...editingVariantPrice, [variantId]: "" });
    }
    
    if (stock && !isNaN(parseInt(stock))) {
      updates.stockQuantity = parseInt(stock);
      setEditingVariantStock({ ...editingVariantStock, [variantId]: "" });
    }

    if (Object.keys(updates).length > 0) {
      updateVariantMutation.mutate({ id: variantId, updates });
    }
  };

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  // Filter products by search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inStockCount = products.filter(p => p.inStock).length;
  const bestsellersCount = products.filter(p => p.isBestseller).length;

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authCheck?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Ozeco Inventory Management</p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="newsletter" data-testid="tab-newsletter">
              <Mail className="mr-2 h-4 w-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Across 6 brands</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inStockCount}</div>
              <p className="text-xs text-muted-foreground">Available for purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bestsellers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bestsellersCount}</div>
              <p className="text-xs text-muted-foreground">Featured on homepage</p>
            </CardContent>
          </Card>
        </div>

            {/* Products Table */}
            <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Product Inventory</CardTitle>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-products"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Quantity</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Bestseller</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isExpanded = expandedProducts.has(product.id);
                    return (
                      <>
                        <TableRow key={product.id} data-testid={`row-product-${product.slug}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleProductExpansion(product.id)}
                                className="h-8 w-8"
                                data-testid={`button-toggle-variants-${product.slug}`}
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded bg-muted"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.brand}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">£{product.price}</span>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="New price"
                              value={editingPrice[product.id] || ""}
                              onChange={(e) => setEditingPrice({ ...editingPrice, [product.id]: e.target.value })}
                              className="w-24 h-8 text-sm"
                              data-testid={`input-price-${product.slug}`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePriceUpdate(product.id)}
                              disabled={!editingPrice[product.id] || updateProductMutation.isPending}
                              data-testid={`button-update-price-${product.slug}`}
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{product.stockQuantity || 0}</span>
                              {product.stockQuantity && product.stockQuantity < 3 && product.stockQuantity > 0 && (
                                <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                              )}
                              {product.stockQuantity === 0 && (
                                <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                placeholder="Qty"
                                value={editingStock[product.id] || ""}
                                onChange={(e) => setEditingStock({ ...editingStock, [product.id]: e.target.value })}
                                className="w-20 h-8 text-sm"
                                data-testid={`input-stock-${product.slug}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStockQuantityUpdate(product.id)}
                                disabled={!editingStock[product.id] || updateProductMutation.isPending}
                                data-testid={`button-update-stock-${product.slug}`}
                              >
                                Set
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Switch
                            checked={product.inStock}
                            onCheckedChange={() => handleStockToggle(product.id, product.inStock)}
                            disabled={updateProductMutation.isPending}
                            data-testid={`switch-stock-${product.slug}`}
                          />
                          <div className="flex flex-col items-center">
                            <Label className="text-xs">
                              {product.inStock && product.stockQuantity && product.stockQuantity > 0 ? "✓ Available" : "✗ Unavailable"}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {product.inStock ? "Listed" : "Hidden"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={product.isBestseller}
                            onCheckedChange={() => handleBestsellerToggle(product.id, product.isBestseller)}
                            disabled={updateProductMutation.isPending}
                            data-testid={`switch-bestseller-${product.slug}`}
                          />
                          <Label className="text-xs">
                            {product.isBestseller ? "Yes" : "No"}
                          </Label>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <ProductVariants
                            productId={product.id}
                            onUpdateVariant={handleVariantUpdate}
                            editingVariantPrice={editingVariantPrice}
                            editingVariantStock={editingVariantStock}
                            setEditingVariantPrice={setEditingVariantPrice}
                            setEditingVariantStock={setEditingVariantStock}
                            isPending={updateVariantMutation.isPending}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
                </TableBody>
              </Table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newsletterSubscribers.length}</div>
                <p className="text-xs text-muted-foreground">Newsletter signups with discount codes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                {subscribersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : newsletterSubscribers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No subscribers yet
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Discount Code</TableHead>
                        <TableHead>Subscribed Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsletterSubscribers.map((subscriber) => (
                        <TableRow key={subscriber.id} data-testid={`row-subscriber-${subscriber.id}`}>
                          <TableCell className="font-medium" data-testid={`text-email-${subscriber.id}`}>
                            {subscriber.email}
                          </TableCell>
                          <TableCell data-testid={`text-code-${subscriber.id}`}>
                            <Badge variant="secondary" className="font-mono">
                              {subscriber.discountCode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground" data-testid={`text-date-${subscriber.id}`}>
                            {new Date(subscriber.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
