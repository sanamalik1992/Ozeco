import Link from "next/link";

export function ComingSoon({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Coming next
      </div>
      <h1 className="mt-4 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl md:text-6xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 max-w-md text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-ink/90 transition-colors"
      >
        Return home
      </Link>
    </section>
  );
}
