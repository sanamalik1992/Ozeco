import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        404
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tighter">
        Page not found.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        The page you&apos;re looking for may have moved or no longer exists.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-ink/90"
      >
        Return home
      </Link>
    </section>
  );
}
