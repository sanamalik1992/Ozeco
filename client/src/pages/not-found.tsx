import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ShoppingBag, Phone } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-destructive/10 p-6">
                  <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
              </div>
              
              <h1 className="text-4xl font-display font-bold mb-4" data-testid="text-404-title">
                404 - Page Not Found
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/">
                  <Button size="lg" data-testid="button-home">
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </Link>
                
                <Link href="/shop">
                  <Button size="lg" variant="outline" data-testid="button-shop">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Browse E-Bikes
                  </Button>
                </Link>
                
                <Link href="/contact">
                  <Button size="lg" variant="outline" data-testid="button-contact">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  Need help? Call us at{" "}
                  <a href="tel:03333398590" className="text-primary font-semibold hover:underline">
                    0333 339 8590
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
