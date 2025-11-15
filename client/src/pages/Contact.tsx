import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-center" data-testid="text-contact-title">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              Thank you for visiting Ozeco. We're here to assist you. If you have any questions or need help, don't hesitate to reach out.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card data-testid="card-contact-info-email">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email Address</h3>
                    <a href="mailto:support@ozeco.co.uk" className="text-muted-foreground hover:text-primary transition-colors">
                      support@ozeco.co.uk
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-info-phone">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Phone Number</h3>
                    <a href="tel:03333398590" className="text-muted-foreground hover:text-primary transition-colors">
                      03333398590
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">WhatsApp Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-contact-info-hours">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Hours</h3>
                    <p className="text-muted-foreground">Mon-Fri: 9:00 AM - 5:30 PM (GMT)</p>
                    <p className="text-muted-foreground">Sat-Sun: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      data-testid="input-contact-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Comment</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      required
                      data-testid="input-contact-message"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-contact-submit">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Business Name</h3>
                  <p className="text-muted-foreground">Ozeco Ltd</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Company Number</h3>
                  <p className="text-muted-foreground">15445991</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Business Address
                  </h3>
                  <p className="text-muted-foreground">
                    Unit A<br />
                    82 James Carter Road<br />
                    Mildenhall<br />
                    IP28 7DE<br />
                    United Kingdom
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Support Hours</h3>
                  <p className="text-muted-foreground">Monday to Friday - 9:00 AM to 5:30 PM (GMT)</p>
                  <p className="text-muted-foreground">Saturday and Sunday - Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
