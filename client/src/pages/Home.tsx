import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import BrandsSection from "@/components/BrandsSection";
import VideoSection from "@/components/VideoSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <BrandsSection />
        <VideoSection />
        <FeaturedProducts />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
