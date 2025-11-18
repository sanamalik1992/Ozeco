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
import { Loader2, LogOut, Search, Package, TrendingUp, DollarSign, ShoppingBag, Mail, ChevronDown, ChevronUp, Plus, Trash2, Edit, ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AdminOrders from "./AdminOrders";

const variantFormSchema = z.object({
  name: z.string().min(1, "Variant type is required"),
  customName: z.string().optional(),
  value: z.string().min(1, "Variant value is required"),
  price: z.string().min(1, "Price is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be a positive number"),
  stockQuantity: z.string().min(1, "Stock quantity is required").refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, "Stock must be a non-negative integer"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface ManageVariantsDialogProps {
  productId: string;
  productName: string;
}

function ProductionResetButton() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/reset-production-data", {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset production data");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast({
        title: "Production data reset successful",
        description: data.message || "All reviews, photos, and blog posts have been reset with correct dates and images.",
      });
      setConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        data-testid="button-reset-production"
        className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Reset Production Data
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Production Database?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p><strong>This will delete and re-seed:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>All reviews (will be replaced with 100-150 per product with varied dates 2023-2025)</li>
                <li>All customer photos (will be replaced with 33 approved photos)</li>
                <li>All blog posts (will be replaced with 5 posts with working images)</li>
              </ul>
              <p className="text-orange-600 dark:text-orange-400 font-semibold mt-4">⚠️ Products and orders will NOT be affected.</p>
              <p className="mt-2">This operation typically takes 10-20 seconds. Are you sure?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reset">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="bg-orange-600 text-white hover:bg-orange-700"
              data-testid="button-confirm-reset"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Production Data"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FixProductImagesButton() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fixImagesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/fix-product-images", {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fix product images");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product images updated",
        description: data.message || `Updated ${data.updatedCount} product images.`,
      });
      setConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Image fix failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        data-testid="button-fix-images"
        className="border-primary text-primary hover:bg-primary/10"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Fix Product Images
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fix Product Images?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will update all 16 product images to use the correct URLs from the seed file.</p>
              <p className="text-muted-foreground">Useful if product images are broken or showing placeholders.</p>
              <p className="mt-2">This operation takes a few seconds. Continue?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-fix-images">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fixImagesMutation.mutate()}
              disabled={fixImagesMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-confirm-fix-images"
            >
              {fixImagesMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                "Fix Images"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SyncProductVariantsButton() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const syncVariantsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/sync-variants", {});
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sync product variants");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast({
        title: "Product variants synced",
        description: data.message || `Created ${data.created} variants, skipped ${data.skipped} existing.`,
      });
      setConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Variant sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        data-testid="button-sync-variants"
        className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
      >
        <Package className="h-4 w-4 mr-2" />
        Sync Product Variants
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Product Variants?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will automatically add all product variants (colours, wheel sizes, battery options) to your products.</p>
              <p className="font-semibold">This includes:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>ENGWE T14 (4 colors)</li>
                <li>ENGWE Engine Pro 2.0 (3 colors)</li>
                <li>ENGWE Engine X (3 colors)</li>
                <li>ENGWE EP-2 Boost (3 colors)</li>
                <li>ENGWE L20 (2 colors)</li>
                <li>Eleglide M1 Plus (2 wheel sizes)</li>
                <li>Eleglide M2 (2 wheel sizes)</li>
                <li>Duotts C29 (2 battery options)</li>
                <li>Touroll U1 (2 wheel sizes)</li>
                <li>Fiido D3 Pro (2 colors)</li>
              </ul>
              <p className="text-muted-foreground mt-2">Total: 24 variants across 10 products</p>
              <p className="mt-2">Variants that already exist will be skipped. Continue?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-sync-variants">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => syncVariantsMutation.mutate()}
              disabled={syncVariantsMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
              data-testid="button-confirm-sync-variants"
            >
              {syncVariantsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Variants"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ManageVariantsDialog({ productId, productName }: ManageVariantsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);

  const { data: variants = [], isLoading } = useQuery<ProductVariant[]>({
    queryKey: ["/api/products", productId, "variants"],
  });

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: "",
      customName: "",
      value: "",
      price: "",
      stockQuantity: "",
      image: "",
    },
  });

  const watchedName = form.watch("name");

  const createVariantMutation = useMutation({
    mutationFn: async (data: VariantFormValues) => {
      const variantName = data.name === "Other" ? (data.customName || "Other") : data.name;
      const payload = {
        name: variantName,
        value: data.value,
        price: data.price,
        stockQuantity: parseInt(data.stockQuantity),
        image: data.image || null,
      };
      const response = await apiRequest("POST", `/api/admin/products/${productId}/variants`, payload);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create variant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === "/api/products" && 
          query.queryKey[2] === "variants"
      });
      toast({
        title: "Variant created",
        description: "The variant has been successfully added",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create variant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/variants/${variantId}`, {});
      if (!response.ok) throw new Error("Failed to delete variant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === "/api/products" && 
          query.queryKey[2] === "variants"
      });
      toast({
        title: "Variant deleted",
        description: "The variant has been successfully removed",
      });
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    },
    onError: () => {
      toast({
        title: "Failed to delete variant",
        description: "An error occurred while deleting the variant",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (variant: ProductVariant) => {
    setVariantToDelete(variant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (variantToDelete) {
      deleteVariantMutation.mutate(variantToDelete.id);
    }
  };

  const onSubmit = (data: VariantFormValues) => {
    createVariantMutation.mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-manage-variants">
            <Edit className="h-4 w-4 mr-2" />
            Manage Variants
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Product Variants - {productName}</DialogTitle>
            <DialogDescription>
              Add, edit, or delete product variant options (colours, wheel sizes, battery options, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Variant</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variant Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-variant-type">
                                  <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Color">Colour</SelectItem>
                                <SelectItem value="Wheel Size">Wheel Size</SelectItem>
                                <SelectItem value="Battery">Battery</SelectItem>
                                <SelectItem value="Other">Other (Custom)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {watchedName === "Other" && (
                        <FormField
                          control={form.control}
                          name="customName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Type Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Motor Type" {...field} data-testid="input-custom-variant-type" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variant Value</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Black, 29 Inch, Double Battery" {...field} data-testid="input-variant-value" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (£)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="999.99" {...field} data-testid="input-new-variant-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stockQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" placeholder="10" {...field} data-testid="input-new-variant-stock" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/variant-image.jpg" {...field} data-testid="input-variant-image" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={createVariantMutation.isPending}
                      data-testid="button-create-variant"
                    >
                      {createVariantMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variant
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-3">Current Variants ({variants.length})</h3>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading variants...</span>
                </div>
              ) : variants.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
                  No variants configured yet. Add your first variant above.
                </p>
              ) : (
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <Card key={variant.id} data-testid={`card-variant-${variant.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {variant.image && (
                            <img 
                              src={variant.image} 
                              alt={variant.value}
                              className="w-16 h-16 object-contain rounded bg-muted"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{variant.name}</Badge>
                              <span className="font-semibold">{variant.value}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Price: £{variant.price}</span>
                              <span>Stock: {variant.stockQuantity} units</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(variant)}
                            disabled={deleteVariantMutation.isPending}
                            data-testid={`button-delete-variant-${variant.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the variant "{variantToDelete?.name}: {variantToDelete?.value}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-variant">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover-elevate"
              data-testid="button-confirm-delete-variant"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ProductVariantsProps {
  productId: string;
  productName: string;
  onUpdateVariant: (variantId: string, price?: string, stock?: string) => void;
  editingVariantPrice: { [key: string]: string };
  editingVariantStock: { [key: string]: string };
  setEditingVariantPrice: (state: { [key: string]: string }) => void;
  setEditingVariantStock: (state: { [key: string]: string }) => void;
  isPending: boolean;
}

function ProductVariants({ productId, productName, onUpdateVariant, editingVariantPrice, editingVariantStock, setEditingVariantPrice, setEditingVariantStock, isPending }: ProductVariantsProps) {
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
    <div className="p-6 bg-accent/20 border-l-4 border-l-primary">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Package className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold">Product Variants - Adjust Price & Stock</h4>
        <Badge variant="default">{variants.length} variant{variants.length !== 1 ? 's' : ''}</Badge>
        <ManageVariantsDialog productId={productId} productName={productName} />
      </div>
      <div className="space-y-3">
        {variants.map((variant) => (
          <Card key={variant.id} className="p-4 bg-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <Badge variant="outline" className="mb-2 w-fit" data-testid={`badge-variant-type-${variant.id}`}>{variant.name}</Badge>
                <p className="text-base font-semibold" data-testid={`text-variant-value-${variant.id}`}>{variant.value}</p>
                {variant.image && (
                  <img 
                    src={variant.image} 
                    alt={variant.value}
                    className="mt-2 w-20 h-20 object-contain rounded bg-muted"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Price</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-lg font-bold text-primary">
                    £<span data-testid={`text-variant-price-${variant.id}`}>{variant.price}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="New price"
                    value={editingVariantPrice[variant.id] || ""}
                    onChange={(e) => setEditingVariantPrice({ ...editingVariantPrice, [variant.id]: e.target.value })}
                    className="w-28"
                    data-testid={`input-variant-price-${variant.id}`}
                  />
                  <Button
                    size="sm"
                    onClick={() => onUpdateVariant(variant.id, editingVariantPrice[variant.id])}
                    disabled={!editingVariantPrice[variant.id] || isPending}
                    data-testid={`button-update-variant-price-${variant.id}`}
                  >
                    Update
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Stock Quantity</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold" data-testid={`text-variant-stock-${variant.id}`}>{variant.stockQuantity}</span>
                    <span className="text-sm text-muted-foreground">units</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Qty"
                    value={editingVariantStock[variant.id] || ""}
                    onChange={(e) => setEditingVariantStock({ ...editingVariantStock, [variant.id]: e.target.value })}
                    className="w-24"
                    data-testid={`input-variant-stock-${variant.id}`}
                  />
                  <Button
                    size="sm"
                    onClick={() => onUpdateVariant(variant.id, undefined, editingVariantStock[variant.id])}
                    disabled={!editingVariantStock[variant.id] || isPending}
                    data-testid={`button-update-variant-stock-${variant.id}`}
                  >
                    Set
                  </Button>
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
  const [variantCounts, setVariantCounts] = useState<{ [key: string]: number }>({});

  // Check if admin is authenticated
  const { data: authCheck, isLoading: authLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Auto-expand products with variants and fetch variant counts
  useEffect(() => {
    if (products.length > 0) {
      const fetchVariantCounts = async () => {
        const counts: { [key: string]: number } = {};
        const newExpanded = new Set<string>();
        
        for (const product of products) {
          try {
            const response = await fetch(`/api/products/${product.id}/variants`);
            if (response.ok) {
              const variants = await response.json();
              counts[product.id] = variants.length;
              // Auto-expand products with variants
              if (variants.length > 0) {
                newExpanded.add(product.id);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch variants for ${product.id}:`, error);
          }
        }
        
        setVariantCounts(counts);
        setExpandedProducts(newExpanded);
      };
      
      fetchVariantCounts();
    }
  }, [products]);

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
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{product.name}</p>
                                  {variantCounts[product.id] > 0 && (
                                    <Badge variant="secondary" className="text-xs" data-testid={`badge-variant-count-${product.slug}`}>
                                      {variantCounts[product.id]} variant{variantCounts[product.id] !== 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
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
                            productName={product.name}
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

            <Card className="border-orange-200 dark:border-orange-900">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">Production Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Use this only on your published production site</strong> if reviews have wrong dates, blog posts are missing, or images aren't loading correctly.
                </p>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p className="text-sm font-semibold">Reset Production Data:</p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>Deletes all reviews and customer photos</li>
                    <li>Deletes all blog posts</li>
                    <li>Re-seeds with 100-150 reviews per product (varied dates 2023-2025)</li>
                    <li>Re-seeds with 33 customer photos</li>
                    <li>Re-seeds with 5 blog posts with working images</li>
                    <li><strong className="text-primary">Products, orders, and variants are NOT affected</strong></li>
                  </ul>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <ProductionResetButton />
                  <FixProductImagesButton />
                  <SyncProductVariantsButton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
