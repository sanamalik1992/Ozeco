import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PostcodeLookup from "./PostcodeLookup";

const shippingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  shippingAddressLine1: z.string().min(5, "Address is required"),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().min(2, "City is required"),
  shippingPostalCode: z.string().min(3, "Postal code is required"),
  shippingCountry: z.string().default("GB"),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  defaultValues?: Partial<ShippingFormData>;
  children: React.ReactNode;
}

export default function ShippingForm({ onSubmit, defaultValues, children }: ShippingFormProps) {
  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      customerName: defaultValues?.customerName || "",
      customerEmail: defaultValues?.customerEmail || "",
      customerPhone: defaultValues?.customerPhone || "",
      shippingAddressLine1: defaultValues?.shippingAddressLine1 || "",
      shippingAddressLine2: defaultValues?.shippingAddressLine2 || "",
      shippingCity: defaultValues?.shippingCity || "",
      shippingPostalCode: defaultValues?.shippingPostalCode || "",
      shippingCountry: defaultValues?.shippingCountry || "GB",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Contact Information</h3>
          
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="your.email@example.com" 
                    {...field} 
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    placeholder="07123 456789" 
                    {...field} 
                    data-testid="input-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Shipping Address</h3>
          
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Smith" 
                    {...field} 
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingPostalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postcode</FormLabel>
                <FormControl>
                  <PostcodeLookup
                    initialValue={field.value}
                    onPostcodeFound={(data) => {
                      form.setValue("shippingPostalCode", data.postcode);
                      form.setValue("shippingCity", data.city);
                      if (data.country) {
                        form.setValue("shippingCountry", data.country);
                      }
                    }}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Enter your postcode and click Find to auto-fill your city
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingAddressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Number & Street</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123 High Street" 
                    {...field} 
                    data-testid="input-address-line1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingAddressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Flat, apartment, building name, etc." 
                    {...field} 
                    data-testid="input-address-line2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City / Town</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="London" 
                    {...field} 
                    data-testid="input-city"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shippingCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="IE">Ireland</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {children}
      </form>
    </Form>
  );
}
