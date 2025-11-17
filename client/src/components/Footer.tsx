import { Link } from "wouter";
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal, SiApplepay, SiGooglepay, SiFacebook, SiInstagram } from "react-icons/si";
import { Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-display font-bold mb-4" data-testid="text-footer-about">
              Ozeco Ltd
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              UK-based Electric bike specialists since 2022, bringing you premium Electric bikes from trusted brands.
            </p>
            <p className="text-xs text-muted-foreground">
              Company No: 15445991
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-shop">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-bikes">
                  All E-Bikes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Mountain" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-mountain">
                  Mountain Bikes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=City" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-city">
                  City Bikes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Folding" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-folding">
                  Folding Bikes
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-bestsellers">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-compare">
                  Compare E-Bikes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-support">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/size-fit-guide" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-size-guide">
                  Size & Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-shipping">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-policy" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-returns">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-warranty">
                  Warranty
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-contact-info">
              Contact Us
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Unit A, 82 James Carter Road<br />Mildenhall, IP28 7DE<br />United Kingdom
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Email: <a href="mailto:support@ozeco.co.uk" className="hover:text-primary transition-colors" data-testid="link-footer-email">support@ozeco.co.uk</a>
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Phone: <a href="tel:03333398590" className="hover:text-primary transition-colors" data-testid="link-footer-phone">0333 339 8590</a>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Mon-Fri: 9:00 AM - 5:30 PM (GMT)
            </p>
            
            {/* Social Media Links */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.instagram.com/ozeco_uk?igsh=MXNieDhwZHQzeXk0Mw%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-instagram"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/share/17gpWpX2xf/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-facebook"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 space-y-4">
          {/* Payment Methods */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">We Accept</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <SiVisa className="h-10 w-auto text-[#1A1F71]" data-testid="payment-visa" />
              <svg className="h-8 w-auto" viewBox="0 0 131.39 86.9" data-testid="payment-mastercard">
                <rect fill="#ff5f00" x="48.37" width="34.66" height="86.9"/>
                <circle fill="#eb001b" cx="43.45" cy="43.45" r="43.45"/>
                <circle fill="#f79e1b" cx="87.94" cy="43.45" r="43.45"/>
              </svg>
              <SiAmericanexpress className="h-8 w-auto text-[#006FCF]" data-testid="payment-amex" />
              <SiPaypal className="h-8 w-auto text-[#0070BA]" data-testid="payment-paypal" />
              <SiApplepay className="h-10 w-auto" data-testid="payment-applepay" />
              <SiGooglepay className="h-10 w-auto" data-testid="payment-googlepay" />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              © 2024 Ozeco Ltd. All rights reserved. Company No: 15445991
            </p>
            
            <div className="flex gap-4 text-sm">
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-terms">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
