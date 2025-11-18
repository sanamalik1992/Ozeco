import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import BrandCarousel from "@/components/BrandCarousel";
import VideoSection from "@/components/VideoSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { useAnalytics } from "@/hooks/use-analytics";

export default function Home() {
  useAnalytics();
  
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <FeaturedProducts />
        <BrandCarousel />
        <VideoSection />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
      <NewsletterPopup />
    </div>
  );
}
