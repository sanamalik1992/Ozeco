import { Link } from "wouter";
import { SiStripe } from "react-icons/si";
import { Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-display font-bold mb-4" data-testid="text-footer-about">
              About Ozeco
            </h3>
            <p className="text-sm text-muted-foreground">
              UK-based e-bike specialists since 2022, bringing you premium electric bikes from trusted brands.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-shop">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/bikes" data-testid="link-footer-bikes">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    All E-Bikes
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/brands" data-testid="link-footer-brands">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Brands
                  </span>
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Best Sellers
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  New Arrivals
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-support">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" data-testid="link-footer-contact">
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Contact Us
                  </span>
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Delivery Information
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Returns Policy
                </span>
              </li>
              <li>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Warranty
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" data-testid="text-footer-contact-info">
              Contact
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Email: info@ozeco.co.uk
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              United Kingdom
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            © 2024 Ozeco.co.uk. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <SiStripe className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
