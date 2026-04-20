import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { TrustBar } from "@/components/site/trust-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ozeco.co.uk"),
  title: {
    default: "Ozeco — UK Electric Bikes",
    template: "%s · Ozeco",
  },
  description:
    "Ozeco — premium electric bikes from Engwe, Eleglide, DYU, DUOTTS and Touroll. Free UK delivery, UK warranty, expert support.",
  openGraph: {
    title: "Ozeco — UK Electric Bikes",
    description:
      "Premium electric bikes with free UK delivery, UK warranty and expert support.",
    url: "https://ozeco.co.uk",
    siteName: "Ozeco",
    locale: "en_GB",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${interTight.variable}`}>
      <body className="min-h-dvh bg-background text-foreground">
        <TrustBar />
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
