import Link from "next/link";

const SHOP = [
  { href: "/shop", label: "All bikes" },
  { href: "/compare", label: "Compare" },
  { href: "/gallery", label: "Customer gallery" },
  { href: "/referral", label: "Refer a friend" },
];

const SUPPORT = [
  { href: "/faq", label: "FAQ" },
  { href: "/size-fit-guide", label: "Size & fit guide" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/returns-policy", label: "Returns" },
  { href: "/warranty", label: "Warranty" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-of-service", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-background">
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-2xl font-black tracking-tighter">OZECO</div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              UK electric bike specialist. Handpicked models from Engwe, Eleglide, DYU, DUOTTS and Touroll.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              <a href="mailto:support@ozeco.co.uk" className="hover:text-foreground transition-colors">
                support@ozeco.co.uk
              </a>
            </p>
          </div>
          <FooterList title="Shop" items={SHOP} />
          <FooterList title="Support" items={SUPPORT} />
          <FooterList title="Legal" items={LEGAL} />
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Ozeco Ltd. All rights reserved.</span>
          <span>Free UK delivery, supported by our UK team.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterList({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.href}>
            <Link
              href={i.href}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
