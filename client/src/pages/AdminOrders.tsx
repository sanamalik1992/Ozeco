import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, Mail, Phone, MapPin, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface OrderWithDetails extends Order {
  items?: Array<{
    product: {
      name: string;
      image: string;
    };
    quantity: number;
    priceAtTime: string;
  }>;
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [editingTracking, setEditingTracking] = useState<{ [key: string]: string }>({});

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Update fulfillment status mutation
  const updateFulfillmentMutation = useMutation({
    mutationFn: async ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${orderId}/fulfillment`, { fulfillmentStatus });
      if (!response.ok) throw new Error("Failed to update order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order Updated",
        description: "Fulfillment status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Update tracking number mutation
  const updateTrackingMutation = useMutation({
    mutationFn: async ({ orderId, trackingNumber }: { orderId: string; trackingNumber: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${orderId}/tracking`, { trackingNumber });
      if (!response.ok) throw new Error("Failed to update tracking number");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Tracking Updated",
        description: "Tracking number updated successfully",
      });
      setEditingTracking({});
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update tracking number",
        variant: "destructive",
      });
    },
  });

  const handleFulfillmentChange = (orderId: string, newStatus: string) => {
    updateFulfillmentMutation.mutate({ orderId, fulfillmentStatus: newStatus });
  };

  const handleTrackingUpdate = (orderId: string) => {
    const trackingNumber = editingTracking[orderId];
    if (trackingNumber !== undefined) {
      updateTrackingMutation.mutate({ orderId, trackingNumber });
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => 
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFulfillmentBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    return (
      <Badge variant="outline">
        {method === 'stripe' ? 'Card/Shop Pay' : 'PayPal'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Orders</h2>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Order List</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-orders"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-mono text-xs">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      £{parseFloat(order.totalAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(order.paymentMethod)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      {getFulfillmentBadge(order.fulfillmentStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={order.fulfillmentStatus}
                          onValueChange={(value) => handleFulfillmentChange(order.id, value)}
                          disabled={updateFulfillmentMutation.isPending}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const response = await fetch(`/api/admin/orders/${order.id}`, { credentials: "include" });
                            const orderDetails = await response.json();
                            setSelectedOrder(orderDetails);
                          }}
                          data-testid={`button-view-${order.id}`}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && !ordersLoading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No orders found matching your search' : 'No orders yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  data-testid="button-close-details"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p>{selectedOrder.shippingAddressLine1}</p>
                  {selectedOrder.shippingAddressLine2 && <p>{selectedOrder.shippingAddressLine2}</p>}
                  <p>{selectedOrder.shippingCity}, {selectedOrder.shippingPostalCode}</p>
                  <p>{selectedOrder.shippingCountry}</p>
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Tracking Information
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  {selectedOrder.trackingNumber ? (
                    <p className="text-sm">
                      <span className="font-medium">Tracking Number:</span>{" "}
                      <code className="bg-background px-2 py-1 rounded">{selectedOrder.trackingNumber}</code>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tracking number added yet</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Enter tracking number"
                      value={editingTracking[selectedOrder.id] ?? selectedOrder.trackingNumber ?? ""}
                      onChange={(e) => setEditingTracking({ ...editingTracking, [selectedOrder.id]: e.target.value })}
                      className="flex-1"
                      data-testid="input-tracking-number"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleTrackingUpdate(selectedOrder.id)}
                      disabled={updateTrackingMutation.isPending}
                      data-testid="button-update-tracking"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded bg-muted"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">£{(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Order Date:
                  </span>
                  <span>{format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Payment Method:</span>
                  <span>{selectedOrder.paymentMethod === 'stripe' ? 'Card/Shop Pay' : 'PayPal'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Payment Status:</span>
                  <Badge variant="default">{selectedOrder.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>£{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
