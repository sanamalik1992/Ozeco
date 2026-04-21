import { Truck, ShieldCheck, Headset } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "Free UK delivery",
    body: "Every bike ships free, tracked, and arrives in 3–5 working days across Great Britain.",
  },
  {
    icon: ShieldCheck,
    title: "UK warranty",
    body: "Two years on every frame, one year on every component. Serviced from our UK team.",
  },
  {
    icon: Headset,
    title: "Expert support",
    body: "Real riders on the line. Reach us on email, WhatsApp, or chat — any day of the week.",
  },
];

export function WhyOzeco() {
  return (
    <section className="border-y border-border/60 bg-paper-dim/50 py-24 md:py-28">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col items-start gap-4">
              <div className="flex size-10 items-center justify-center rounded-full border border-border/60 text-foreground">
                <item.icon className="size-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
