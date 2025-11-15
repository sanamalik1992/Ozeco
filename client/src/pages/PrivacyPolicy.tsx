import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="bg-card rounded-lg p-8 space-y-6">
            <section>
              <p className="text-muted-foreground mb-4">
                <strong>Last Updated:</strong> November 2024
              </p>
              <p className="text-muted-foreground">
                Ozeco Ltd ("we", "our", or "us") is committed to protecting your privacy. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when you 
                visit our website ozeco.co.uk or make a purchase from us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name, email address, phone number, and delivery address</li>
                <li>Payment information (processed securely via Stripe and PayPal)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
                <li>Newsletter subscription preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and enhance security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organisational measures to protect your personal 
                information against unauthorised access, alteration, disclosure, or destruction. Payment 
                information is encrypted and processed through secure payment gateways (Stripe and PayPal). 
                We never store your complete credit card details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies & Tracking</h2>
              <p className="text-muted-foreground mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Remember your shopping cart and preferences</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Personalize your browsing experience</li>
                <li>Deliver targeted marketing (with consent)</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground mb-3">
                We work with trusted third-party service providers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Payment Processing:</strong> Stripe and PayPal</li>
                <li><strong>Shipping Partners:</strong> Courier services for delivery</li>
                <li><strong>Email Services:</strong> For order confirmations and newsletters</li>
                <li><strong>Analytics:</strong> To understand website usage</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                These providers only have access to information necessary to perform their functions 
                and are obligated to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights (GDPR)</h2>
              <p className="text-muted-foreground mb-3">
                Under UK GDPR, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Restriction:</strong> Limit how we use your data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Object:</strong> Opt-out of marketing communications</li>
                <li><strong>Withdraw Consent:</strong> At any time</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                To exercise these rights, please contact us using the details below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to fulfill the purposes 
                outlined in this policy, comply with legal obligations, resolve disputes, and enforce 
                our agreements. Order and transaction data is typically retained for 7 years to comply 
                with UK tax and accounting requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our website is not intended for children under 16. We do not knowingly collect personal 
                information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We'll notify you of significant 
                changes by posting the new policy on this page and updating the "Last Updated" date. 
                Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-3">
                For questions about this Privacy Policy or to exercise your data rights:
              </p>
              <p className="text-muted-foreground">
                <strong>Ozeco Ltd</strong><br />
                Email: privacy@ozeco.co.uk<br />
                Address: United Kingdom
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
