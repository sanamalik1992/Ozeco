import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye } from "lucide-react";
import type { BlogPost } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Latest News & Guides
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-blog-title">
              Electric Bikes Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert guides, reviews, and the latest news about electric bikes and sustainable transportation.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No blog posts yet. Check back soon for updates!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} data-testid={`link-blog-${post.slug}`}>
                  <Card className="h-full hover-elevate active-elevate-2 overflow-hidden cursor-pointer">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-blog-${post.slug}`}
                      />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" data-testid={`badge-category-${post.slug}`}>
                          {post.category}
                        </Badge>
                      </div>
                      <h2 className="text-xl font-semibold line-clamp-2" data-testid={`text-title-${post.slug}`}>
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm line-clamp-3" data-testid={`text-excerpt-${post.slug}`}>
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(post.publishedDate), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>5 min read</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By {post.author}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
