import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VideoSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary text-primary-foreground">See It In Action</Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4" data-testid="text-video-title">
            See Why UK Riders Love the Eleglide M2
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our bestseller in action - real performance, real results, real UK riders.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden shadow-xl">
            <div className="relative aspect-video bg-muted">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/ix1_uFwQjjw"
                title="Eleglide M2 Electric Bike - UK's Best Seller"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                data-testid="video-player"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
