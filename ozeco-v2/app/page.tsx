import { Suspense } from "react";
import { Hero, HeroSkeleton } from "@/components/home/hero";
import {
  FeaturedSpotlight,
  FeaturedSpotlightSkeleton,
} from "@/components/home/featured-spotlight";
import { RangeRow, RangeRowSkeleton } from "@/components/home/range-row";
import { WhyOzeco } from "@/components/home/why-ozeco";
import {
  ReviewsSection,
  ReviewsSectionSkeleton,
} from "@/components/home/reviews-section";
import {
  CustomerGallery,
  CustomerGallerySkeleton,
} from "@/components/home/customer-gallery";
import { BrandStrip } from "@/components/home/brand-strip";
import {
  BlogTeaser,
  BlogTeaserSkeleton,
} from "@/components/home/blog-teaser";
import { Newsletter } from "@/components/home/newsletter";

export const revalidate = 300; // 5 minutes

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <Suspense fallback={<FeaturedSpotlightSkeleton />}>
        <FeaturedSpotlight />
      </Suspense>

      <Suspense fallback={<RangeRowSkeleton />}>
        <RangeRow />
      </Suspense>

      <WhyOzeco />

      <Suspense fallback={<ReviewsSectionSkeleton />}>
        <ReviewsSection />
      </Suspense>

      <Suspense fallback={<CustomerGallerySkeleton />}>
        <CustomerGallery />
      </Suspense>

      <Suspense fallback={null}>
        <BrandStrip />
      </Suspense>

      <Suspense fallback={<BlogTeaserSkeleton />}>
        <BlogTeaser />
      </Suspense>

      <Newsletter />
    </>
  );
}
