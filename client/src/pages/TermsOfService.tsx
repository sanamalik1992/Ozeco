import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="bg-card rounded-lg p-8 space-y-6">
            <section>
              <p className="text-muted-foreground mb-4">
                <strong>Last Updated:</strong> November 2024
              </p>
              <p className="text-muted-foreground">
                These Terms of Service ("Terms") govern your use of the Ozeco website (ozeco.co.uk) 
                and the purchase of Electric bikes from Ozeco Ltd. By accessing our website or making 
                a purchase, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Company Information</h2>
              <p className="text-muted-foreground">
                <strong>Company Name:</strong> Ozeco Ltd<br />
                <strong>Company Number:</strong> Registered in England and Wales<br />
                <strong>Website:</strong> ozeco.co.uk<br />
                <strong>Trading Since:</strong> 2022
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Product Information</h2>
              <p className="text-muted-foreground mb-3">
                We make every effort to display our Electric bikes as accurately as possible. However:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Colors may vary slightly due to screen settings</li>
                <li>Specifications are subject to manufacturer updates</li>
                <li>Stock availability is not guaranteed until payment is confirmed</li>
                <li>We reserve the right to limit quantities per customer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Pricing & Payment</h2>
              <p className="text-muted-foreground mb-3">
                All prices are listed in British Pounds (GBP) and include VAT where applicable:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Prices are subject to change without notice</li>
                <li>Payment is required in full at the time of order</li>
                <li>We accept Stripe (credit/debit cards, Shop Pay) and PayPal</li>
                <li>Promotional codes cannot be combined unless stated</li>
                <li>We reserve the right to cancel orders with pricing errors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Orders & Contracts</h2>
              <p className="text-muted-foreground">
                When you place an order, you're making an offer to purchase. We'll send an order 
                confirmation email, but the contract is only formed when we dispatch your item and 
                send a dispatch confirmation. We reserve the right to refuse or cancel orders at our 
                discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Delivery</h2>
              <p className="text-muted-foreground mb-3">
                Delivery terms:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Dispatch within 1 working day, shipping time 2-3 working days</li>
                <li>Delivery to UK mainland addresses only (additional areas may apply)</li>
                <li>Risk passes to you upon delivery</li>
                <li>You must inspect items upon delivery and report damage within 48 hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Returns & Refunds</h2>
              <p className="text-muted-foreground">
                You have a 30-day right to return unused Electric bikes in original condition. 
                Please see our Returns Policy for full details. Your statutory rights are not affected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Warranty</h2>
              <p className="text-muted-foreground">
                All Electric bikes are covered by the manufacturer's warranty. Warranty periods vary 
                by brand and component. Warranty does not cover normal wear and tear, misuse, accidents, 
                or unauthorized modifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Use of Electric Bikes</h2>
              <p className="text-muted-foreground mb-3">
                Electric bikes must be used in accordance with UK law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Maximum power output: 250W</li>
                <li>Maximum assisted speed: 15.5 mph (25 km/h)</li>
                <li>Minimum rider age: 14 years</li>
                <li>No license, insurance, or tax required for legal e-bikes</li>
                <li>Helmets strongly recommended</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You are responsible for ensuring your e-bike complies with local regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, Ozeco Ltd shall not be liable for any 
                indirect, incidental, special, or consequential damages arising from the use of 
                our products or website. Our total liability is limited to the purchase price of 
                the product in question. This does not affect your statutory rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on ozeco.co.uk, including text, images, logos, and graphics, is the 
                property of Ozeco Ltd or our licensors. You may not reproduce, distribute, or 
                create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. User Conduct</h2>
              <p className="text-muted-foreground mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Use our website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit viruses or malicious code</li>
                <li>Engage in fraudulent activity</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms are governed by the laws of England and Wales. Any disputes shall be 
                subject to the exclusive jurisdiction of the English courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Changes will be effective 
                immediately upon posting. Your continued use of our website after changes constitutes 
                acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms or any other matter:<br />
                <strong>Email:</strong> info@ozeco.co.uk<br />
                <strong>Company:</strong> Ozeco Ltd<br />
                <strong>Location:</strong> United Kingdom
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
