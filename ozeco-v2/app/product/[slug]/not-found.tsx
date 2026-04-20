import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tighter">
        We couldn&apos;t find that bike.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        It may have been renamed or sold out. Browse our current range instead.
      </p>
      <Link
        href="/shop"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-ink/90"
      >
        View all bikes
      </Link>
    </section>
  );
}
