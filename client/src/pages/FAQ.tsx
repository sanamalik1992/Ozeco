import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about Electric bikes, ordering, delivery, and more.
          </p>
          
          <div className="bg-card rounded-lg p-8">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="shipping" data-testid="accordion-shipping">
                <AccordionTrigger className="text-lg font-semibold">
                  How long does delivery take?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We dispatch within 1 working day, and shipping takes 2-3 working days to most UK mainland 
                  addresses. You'll receive a tracking number once your order is dispatched so you can monitor 
                  its progress.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delivery-cost" data-testid="accordion-delivery-cost">
                <AccordionTrigger className="text-lg font-semibold">
                  Is delivery free?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We offer free delivery on all Electric bikes to UK mainland addresses. There are no 
                  hidden fees or surprise charges at checkout.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="assembly" data-testid="accordion-assembly">
                <AccordionTrigger className="text-lg font-semibold">
                  Do I need to assemble the bike?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Your Electric bike arrives approximately 85% assembled. You'll need to attach the handlebars, 
                  pedals, and front wheel - a simple process that takes about 15-30 minutes. Full instructions 
                  and necessary tools are included with every order.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="legal" data-testid="accordion-legal">
                <AccordionTrigger className="text-lg font-semibold">
                  Do I need a license to ride an Electric bike in the UK?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No! As long as your Electric bike meets UK regulations (250W motor, 15.5 mph max assisted speed), 
                  you don't need a license, insurance, or tax. The majority of our bikes comply with UK law. The minimum age 
                  to ride is 14 years, and we strongly recommend wearing a helmet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="range" data-testid="accordion-range">
                <AccordionTrigger className="text-lg font-semibold">
                  How far can I travel on a single charge?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Range varies by model, rider weight, terrain, and assist level. Our bikes typically offer 
                  between 30-80 miles per charge. Check the specific product page for detailed range information 
                  for each model.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="charging" data-testid="accordion-charging">
                <AccordionTrigger className="text-lg font-semibold">
                  How long does it take to charge the battery?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Most of our Electric bike batteries fully charge in 4-6 hours. You can charge the battery 
                  while it's on the bike or remove it for convenient indoor charging. All bikes come with a 
                  UK plug charger.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="warranty" data-testid="accordion-warranty">
                <AccordionTrigger className="text-lg font-semibold">
                  What warranty is included?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  All Electric bikes come with a manufacturer's warranty covering defects in materials and 
                  workmanship. Warranty periods vary by brand and component (typically 1-2 years for frame 
                  and motor, 6-12 months for battery). Full warranty details are provided with your bike.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="returns" data-testid="accordion-returns">
                <AccordionTrigger className="text-lg font-semibold">
                  Can I return my bike if I don't like it?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We offer a 14-day return window. If you're not completely satisfied, you can return 
                  your bike in unused condition with original packaging for a full refund. See our Returns 
                  Policy for complete details.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment" data-testid="accordion-payment">
                <AccordionTrigger className="text-lg font-semibold">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept all major credit and debit cards through Stripe (including Shop Pay for faster 
                  checkout), and PayPal. All payments are processed securely with industry-standard encryption.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="maintenance" data-testid="accordion-maintenance">
                <AccordionTrigger className="text-lg font-semibold">
                  How do I maintain my Electric bike?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Regular maintenance includes keeping the chain lubricated, checking tire pressure, and 
                  ensuring brakes are functioning properly. Store the battery in a cool, dry place when not 
                  in use. We recommend a professional service every 6-12 months depending on usage.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="weather" data-testid="accordion-weather">
                <AccordionTrigger className="text-lg font-semibold">
                  Can I ride in the rain?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, all our Electric bikes are designed to handle light rain and wet conditions. However, 
                  avoid riding through deep water or exposing the bike to heavy downpours for extended periods. 
                  Always dry your bike after wet rides and store it in a dry location.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="weight-limit" data-testid="accordion-weight-limit">
                <AccordionTrigger className="text-lg font-semibold">
                  What is the maximum weight limit?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Weight limits vary by model, typically ranging from 100-120kg (220-265 lbs). Check the 
                  specifications on the product page for the exact limit of your chosen model.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="spare-parts" data-testid="accordion-spare-parts">
                <AccordionTrigger className="text-lg font-semibold">
                  Can I get spare parts and accessories?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We stock spare parts and accessories for all the bikes we sell. Contact our customer 
                  service team via WhatsApp or email for availability and pricing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contact" data-testid="accordion-contact">
                <AccordionTrigger className="text-lg font-semibold">
                  How can I contact customer service?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can reach us via WhatsApp (click the chat button on our website) or email us at 
                  support@ozeco.co.uk. We typically respond within a few hours during business hours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="discount" data-testid="accordion-discount">
                <AccordionTrigger className="text-lg font-semibold">
                  Do you offer discounts or promotions?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! Sign up for our newsletter to receive a £10 discount code for your first order, plus 
                  exclusive access to sales, new product launches, and special promotions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
