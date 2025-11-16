import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Check, AlertCircle } from "lucide-react";
import StarRating from "@/components/StarRating";
import type { Product } from "@shared/schema";

export default function Compare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  useEffect(() => {
    const stored = localStorage.getItem("compareProducts");
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setCompareIds(ids.slice(0, 3)); // Max 3 products
      } catch {
        setCompareIds([]);
      }
    }
  }, []);

  // Clean up stale IDs when products are loaded
  useEffect(() => {
    if (allProducts.length > 0 && compareIds.length > 0) {
      const validIds = compareIds.filter((id) => 
        allProducts.some((p) => p.id === id)
      );
      
      // Update if we found stale IDs
      if (validIds.length !== compareIds.length) {
        setCompareIds(validIds);
        localStorage.setItem("compareProducts", JSON.stringify(validIds));
      }
    }
  }, [allProducts, compareIds]);

  const compareProducts = compareIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  const handleRemove = (id: string) => {
    const newIds = compareIds.filter((cid) => cid !== id);
    setCompareIds(newIds);
    localStorage.setItem("compareProducts", JSON.stringify(newIds));
  };

  const handleAddProduct = (id: string) => {
    if (compareIds.length < 3 && !compareIds.includes(id)) {
      const newIds = [...compareIds, id];
      setCompareIds(newIds);
      localStorage.setItem("compareProducts", JSON.stringify(newIds));
    }
  };

  const availableProducts = allProducts.filter(
    (p) => !compareIds.includes(p.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="heading-compare">
              Compare Electric Bikes
            </h1>
            <p className="text-muted-foreground">
              Compare up to 3 bikes side-by-side to find your perfect match
            </p>
          </div>

          {compareProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">No Products Selected</h2>
                <p className="text-muted-foreground mb-6">
                  Start by selecting products from our shop to compare their features
                </p>
                <Link href="/shop">
                  <Button size="lg" data-testid="button-shop">
                    Browse Electric Bikes
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* Mobile Warning */}
              <div className="lg:hidden mb-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 Tip: For the best comparison experience, view on a larger screen
                </p>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-background border-b-2 border-primary p-4 text-left min-w-[200px]">
                        <span className="font-bold">Features</span>
                      </th>
                      {compareProducts.map((product) => (
                        <th
                          key={product.id}
                          className="border-b-2 border-primary p-4 min-w-[280px]"
                        >
                          <Card>
                            <CardContent className="p-4">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={() => handleRemove(product.id)}
                                data-testid={`button-remove-${product.slug}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-32 object-contain mb-3 bg-background"
                              />
                              <h3 className="font-bold text-sm mb-1">
                                {product.name}
                              </h3>
                              <p className="text-primary font-bold text-lg">
                                £{product.price}
                              </p>
                            </CardContent>
                          </Card>
                        </th>
                      ))}
                      {compareProducts.length < 3 && (
                        <th className="border-b-2 border-primary p-4 min-w-[280px]">
                          <Card className="border-dashed border-2">
                            <CardContent className="p-8 text-center">
                              <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-3">
                                Add Product
                              </p>
                              <select
                                className="w-full p-2 border rounded-md"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAddProduct(e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                data-testid="select-add-product"
                              >
                                <option value="">Select...</option>
                                {availableProducts.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </CardContent>
                          </Card>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Brand */}
                    <CompareRow
                      label="Brand"
                      values={compareProducts.map((p) => (
                        <Badge variant="outline">{p.brand}</Badge>
                      ))}
                    />

                    {/* Category */}
                    <CompareRow
                      label="Category"
                      values={compareProducts.map((p) => p.category)}
                    />

                    {/* Stock Status */}
                    <CompareRow
                      label="Availability"
                      values={compareProducts.map((p) =>
                        p.inStock ? (
                          <Badge variant="default" className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" /> In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )
                      )}
                    />

                    {/* Motor Power */}
                    <CompareRow
                      label="Motor Power"
                      values={compareProducts.map((p) => p.motorPower || "N/A")}
                      highlight
                    />

                    {/* Battery Capacity */}
                    <CompareRow
                      label="Battery Capacity"
                      values={compareProducts.map((p) => p.batteryCapacity || "N/A")}
                      highlight
                    />

                    {/* Max Range */}
                    <CompareRow
                      label="Max Range"
                      values={compareProducts.map((p) => p.maxRange || "N/A")}
                      highlight
                    />

                    {/* Top Speed */}
                    <CompareRow
                      label="Top Speed"
                      values={compareProducts.map((p) => p.topSpeed || "N/A")}
                      highlight
                    />

                    {/* Weight */}
                    <CompareRow
                      label="Weight"
                      values={compareProducts.map((p) => p.weight || "N/A")}
                    />

                    {/* Frame Type */}
                    <CompareRow
                      label="Frame Type"
                      values={compareProducts.map((p) => p.frameType || "N/A")}
                    />

                    {/* Description */}
                    <CompareRow
                      label="Description"
                      values={compareProducts.map((p) => (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {p.description}
                        </p>
                      ))}
                    />

                    {/* Actions */}
                    <tr>
                      <td className="sticky left-0 bg-background p-4 font-semibold border-t-2 border-primary">
                        Actions
                      </td>
                      {compareProducts.map((product) => (
                        <td
                          key={product.id}
                          className="p-4 text-center border-t-2 border-primary"
                        >
                          <div className="space-y-2">
                            <Link href={`/product/${product.slug}`}>
                              <Button
                                className="w-full"
                                data-testid={`button-view-${product.slug}`}
                              >
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </td>
                      ))}
                      {compareProducts.length < 3 && (
                        <td className="p-4 border-t-2 border-primary"></td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 text-center">
                <Link href="/shop">
                  <Button variant="outline" size="lg">
                    Back to Shop
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CompareRow({
  label,
  values,
  highlight = false,
}: {
  label: string;
  values: (string | JSX.Element)[];
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-muted/50" : ""}>
      <td className="sticky left-0 bg-background p-4 font-semibold border-b">
        {label}
      </td>
      {values.map((value, idx) => (
        <td key={idx} className="p-4 text-center border-b">
          {value}
        </td>
      ))}
      {values.length < 3 && <td className="p-4 border-b"></td>}
    </tr>
  );
}
