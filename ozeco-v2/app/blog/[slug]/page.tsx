import { ComingSoon } from "@/components/site/coming-soon";

export const metadata = { title: "Blog post" };

export default function BlogPostStub() {
  return (
    <ComingSoon
      title="This post is coming soon"
      subtitle="Individual blog posts render in Phase 3 alongside the full journal."
    />
  );
}
