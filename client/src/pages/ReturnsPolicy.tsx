import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Returns & Refunds Policy</h1>
          
          <div className="bg-card rounded-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">14-Day Return Window</h2>
              <p className="text-muted-foreground">
                At Ozeco, we want you to be completely satisfied with your Electric bike purchase. 
                If for any reason you're not happy with your order, you can return it within 14 days 
                of delivery for a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Return Conditions</h2>
              <p className="text-muted-foreground mb-3">To be eligible for a return, your Electric bike must meet the following conditions:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>The bike must be in unused condition with minimal signs of wear</li>
                <li>All original packaging, accessories, and documentation must be included</li>
                <li>The bike must not have been modified or damaged</li>
                <li>Battery must not show signs of use or charging beyond initial testing</li>
                <li>You must provide proof of purchase (order number or receipt)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Initiate a Return</h2>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Contact our customer service team via email or WhatsApp</li>
                <li>Provide your order number and reason for return</li>
                <li>We'll send you a return authorization and shipping label</li>
                <li>Carefully repack the bike in its original packaging</li>
                <li>Ship the bike back using the provided label</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
              <p className="text-muted-foreground mb-3">
                Once we receive your returned bike and verify its condition:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>We'll process your refund within 5 business days</li>
                <li>Refunds are issued to your original payment method</li>
                <li>You'll receive an email confirmation when your refund is processed</li>
                <li>Bank processing times may vary (typically 5-10 business days)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Return Shipping Costs</h2>
              <p className="text-muted-foreground">
                We provide free return shipping for faulty or damaged items. For change-of-mind returns, 
                customers are responsible for return shipping costs (typically £25-£40 depending on location).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Damaged or Faulty Items</h2>
              <p className="text-muted-foreground">
                If your Electric bike arrives damaged or develops a fault within the warranty period, 
                please contact us immediately. We'll arrange a free collection and provide a replacement 
                or full refund, whichever you prefer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Warranty Coverage</h2>
              <p className="text-muted-foreground">
                All Electric bikes come with a manufacturer's warranty covering defects in materials 
                and workmanship. Warranty periods vary by brand and component (typically 1-2 years). 
                Please refer to your product documentation for specific warranty terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
              <p className="text-muted-foreground">
                If you have any questions about our returns policy or need assistance with a return, 
                please contact our customer service team. We're here to help make the process as smooth as possible.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
