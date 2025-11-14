import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>
          
          <div className="bg-card rounded-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Fast & Free UK Delivery</h2>
              <p className="text-muted-foreground">
                We offer free delivery on all Electric bikes to addresses within the United Kingdom. 
                Your bike will be carefully packaged and dispatched within 1 working day, with shipping 
                time of 2-3 working days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Timeframes</h2>
              <div className="bg-muted/50 p-4 rounded-md mb-3">
                <p className="font-semibold mb-2">Standard Delivery (Free)</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Dispatch: Within 1 working day</li>
                  <li>Delivery: 2-3 working days</li>
                  <li>Tracking provided for all orders</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Order Processing</h2>
              <p className="text-muted-foreground mb-3">
                Orders are processed Monday to Friday (excluding UK bank holidays):
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Orders placed before 2 PM are typically dispatched the same day</li>
                <li>Orders placed after 2 PM are dispatched the next working day</li>
                <li>Weekend orders are processed on the following Monday</li>
                <li>You'll receive a dispatch confirmation email with tracking details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Coverage</h2>
              <p className="text-muted-foreground mb-3">
                We deliver to all UK mainland addresses including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>England, Scotland, and Wales</li>
                <li>Northern Ireland (may require additional 1-2 days)</li>
                <li>Remote Scottish Highlands and Islands (additional delivery time may apply)</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                For deliveries to the Channel Islands or Isle of Man, please contact us for a quote.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Packaging & Assembly</h2>
              <p className="text-muted-foreground">
                All Electric bikes are securely packaged for safe transit. Your bike will arrive 
                approximately 85% assembled, requiring only basic assembly (handlebars, pedals, front wheel). 
                Full assembly instructions and tools are included with every order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Order Tracking</h2>
              <p className="text-muted-foreground">
                Once your order is dispatched, you'll receive a tracking number via email. You can use 
                this to monitor your delivery progress in real-time. Most deliveries require a signature 
                upon receipt.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Issues</h2>
              <p className="text-muted-foreground mb-3">
                If you experience any issues with your delivery:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Missing delivery: Contact us within 48 hours</li>
                <li>Damaged packaging: Refuse delivery and contact us immediately</li>
                <li>Incorrect item: We'll arrange a free collection and replacement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">International Shipping</h2>
              <p className="text-muted-foreground">
                Currently, we only ship within the United Kingdom. We're working on expanding our 
                delivery options to European countries. Please check back soon or contact us for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
              <p className="text-muted-foreground">
                For any shipping-related questions or to arrange a specific delivery date, 
                please contact our customer service team via WhatsApp or email.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
