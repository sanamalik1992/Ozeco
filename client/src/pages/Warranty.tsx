import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Phone, Mail, MessageCircle, CheckCircle } from "lucide-react";

export default function Warranty() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Warranty & Aftersales Care</h1>
          </div>
          
          <div className="bg-card rounded-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary" />
                12-Month Comprehensive Warranty
              </h2>
              <p className="text-muted-foreground mb-4">
                Every Electric bike purchased from Ozeco comes with a comprehensive 12-month warranty 
                covering defects in materials and workmanship. We stand behind the quality of every 
                bike we sell, ensuring you have peace of mind with your purchase.
              </p>
              <p className="text-muted-foreground">
                As an <span className="font-semibold text-primary">Authorised UK Dealer</span> for 
                ENGWE, Eleglide, DYU, Duotts, Touroll, and Fiido, all our bikes come with full 
                manufacturer backing and official UK warranty coverage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What's Covered</h2>
              <p className="text-muted-foreground mb-3">
                Our 12-month warranty covers the following components and issues:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary">Electrical Components</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Motor assembly and controller</li>
                    <li>Battery pack (capacity loss beyond normal wear)</li>
                    <li>Display and control panel</li>
                    <li>Wiring and electrical connections</li>
                    <li>Throttle and pedal assist sensors</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary">Mechanical Components</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Frame structural integrity</li>
                    <li>Fork and suspension systems</li>
                    <li>Brake system components</li>
                    <li>Drivetrain (gears, chain, derailleur)</li>
                    <li>Wheels and rims (manufacturing defects)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What's Not Covered</h2>
              <p className="text-muted-foreground mb-3">
                The warranty does not cover the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Normal wear and tear items (brake pads, tyres, cables, grips)</li>
                <li>Damage from accidents, misuse, or improper maintenance</li>
                <li>Modifications or repairs done by unauthorized technicians</li>
                <li>Water damage from improper use or storage</li>
                <li>Cosmetic damage that doesn't affect functionality</li>
                <li>Battery degradation within normal operating parameters (less than 20% capacity loss)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Claim Your Warranty</h2>
              <p className="text-muted-foreground mb-4">
                Making a warranty claim is straightforward. Simply follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-4">
                <li>
                  <span className="font-semibold text-foreground">Contact Us</span> - Reach out via phone, email, or WhatsApp with your order number and a description of the issue
                </li>
                <li>
                  <span className="font-semibold text-foreground">Provide Details</span> - Send photos or videos showing the defect and proof of purchase
                </li>
                <li>
                  <span className="font-semibold text-foreground">Assessment</span> - Our technical team will review your claim within 1-2 business days
                </li>
                <li>
                  <span className="font-semibold text-foreground">Resolution</span> - We'll either arrange a repair, send replacement parts, or provide a replacement bike depending on the issue
                </li>
                <li>
                  <span className="font-semibold text-foreground">Free Collection</span> - If needed, we'll arrange free courier collection for faulty bikes
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Aftersales Care & Support</h2>
              <p className="text-muted-foreground mb-4">
                Your relationship with Ozeco doesn't end after purchase. We're committed to providing 
                excellent aftersales support throughout your ownership:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Technical Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Free lifetime technical support via phone, email, and WhatsApp. Our UK-based team 
                      can help with setup, troubleshooting, and maintenance guidance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Genuine Spare Parts</h3>
                    <p className="text-sm text-muted-foreground">
                      We stock genuine OEM replacement parts for all brands we sell. Fast dispatch 
                      ensures you get back on the road quickly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Service & Repairs</h3>
                    <p className="text-sm text-muted-foreground">
                      Beyond warranty, we offer affordable service and repair options. Our technicians 
                      are trained on all major Electric bike brands.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Maintaining Your Warranty</h2>
              <p className="text-muted-foreground mb-3">
                To keep your warranty valid, please follow these guidelines:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Register your bike with us within 30 days of purchase</li>
                <li>Keep your proof of purchase (order confirmation email)</li>
                <li>Follow the manufacturer's maintenance schedule in your user manual</li>
                <li>Use only authorized parts and accessories</li>
                <li>Have major repairs performed by qualified technicians</li>
                <li>Store your bike properly when not in use (indoors, dry conditions)</li>
              </ul>
            </section>

            <section className="bg-primary/5 p-6 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-semibold mb-4">Contact Our Warranty Team</h2>
              <p className="text-muted-foreground mb-6">
                Have questions about your warranty or need to make a claim? Our dedicated team is here to help.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <a 
                  href="tel:03333398590" 
                  className="flex items-center gap-3 p-4 bg-card rounded-lg hover-elevate active-elevate-2 transition-all"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">Phone</div>
                    <div className="text-xs text-muted-foreground">03333398590</div>
                  </div>
                </a>
                <a 
                  href="mailto:support@ozeco.co.uk" 
                  className="flex items-center gap-3 p-4 bg-card rounded-lg hover-elevate active-elevate-2 transition-all"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">Email</div>
                    <div className="text-xs text-muted-foreground">support@ozeco.co.uk</div>
                  </div>
                </a>
                <a 
                  href="https://wa.me/447446610660?text=Hi%20Ozeco,%20I%20need%20help%20with%20my%20warranty" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-card rounded-lg hover-elevate active-elevate-2 transition-all"
                >
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">WhatsApp</div>
                    <div className="text-xs text-muted-foreground">Chat with us</div>
                  </div>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
