import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Heart, Users, Zap } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We're here to support you every step of your Electric biking journey."
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "We partner with premium brands and stand behind every product with comprehensive warranties."
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Our knowledgeable team is ready to help you find the perfect Electric bike for your needs."
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Quick dispatch within 1 working day and 2-3 working days UK delivery on all Electric bikes."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary text-primary-foreground" data-testid="badge-about">
              About Ozeco
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6" data-testid="text-about-title">
              Your Trusted Electric Bike Partner
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Making premium Electric bikes accessible to UK riders since 2022
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6" data-testid="text-story-title">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2022 in Yorkshire, Ozeco was born from a simple mission: to make premium Electric bikes accessible to everyone in the UK. We're now proudly based in Mildenhall, serving customers across the United Kingdom.
                  </p>
                  <p>
                    As a family-run business and authorised UK dealer, we're passionate about sustainable transportation and helping our customers discover the joy of Electric biking. Whether you're commuting to work, exploring the countryside, or running errands around town, we have the perfect Electric bike for your lifestyle.
                  </p>
                  <p>
                    We carefully select and partner with leading brands like ENGWE, Eleglide, DYU, Duotts, Touroll, and Fiido to bring you the best selection at competitive prices, backed by expert support every step of the way.
                  </p>
                </div>
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src="https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Ozeco Team"
                    className="w-full h-full object-cover aspect-video"
                    data-testid="img-team"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-values-title">
                What We Stand For
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our values guide everything we do, from selecting products to supporting customers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6" data-testid={`card-value-${index}`}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Ozeco */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center" data-testid="text-why-choose-title">
                Why Choose Ozeco?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">✓ Premium Brands</h3>
                    <p className="text-sm text-muted-foreground">
                      Carefully curated selection from ENGWE, Eleglide, DYU, Duotts, Touroll, and Fiido
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">✓ Competitive Prices</h3>
                    <p className="text-sm text-muted-foreground">
                      Best value Electric bikes from £359.99 with regular sales and offers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">✓ Fast UK Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Dispatch within 1 working day, 2-3 working days delivery across the UK
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">✓ Expert Support</h3>
                    <p className="text-sm text-muted-foreground">
                      UK-based customer support team available 7 days a week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">✓ 12-Month Warranty</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive warranty coverage on all Electric bikes for peace of mind
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">✓ Secure Checkout</h3>
                    <p className="text-sm text-muted-foreground">
                      Safe and secure payment processing with trusted payment providers
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
