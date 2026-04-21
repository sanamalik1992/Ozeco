import Image from "next/image";
import Link from "next/link";
import { getLatestBlogPosts } from "@/lib/db/queries";
import { assetUrl } from "@/lib/assets";

export async function BlogTeaser() {
  const posts = await getLatestBlogPosts(3);
  if (posts.length === 0) return null;

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Journal
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl md:text-[56px] text-balance">
              Stories, tips & tech.
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden shrink-0 self-end text-sm font-semibold hover:underline underline-offset-4 md:inline-flex"
          >
            All posts →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper-dim">
                <Image
                  src={assetUrl(post.featuredImage)}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={i === 0}
                  className="object-cover transition-transform duration-[500ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-5">
                <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  {post.category} ·{" "}
                  {new Date(post.publishedDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-balance underline-offset-4 group-hover:underline">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogTeaserSkeleton() {
  return (
    <div className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="h-10 w-1/3 rounded-lg bg-paper-dim" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/3] rounded-xl bg-paper-dim" />
              <div className="h-5 w-3/4 rounded-lg bg-paper-dim" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
