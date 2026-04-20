export function TrustBar() {
  return (
    <div className="bg-ink text-paper text-xs font-medium">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 px-6 py-2.5 text-center tracking-wide uppercase">
        <span>Free UK delivery</span>
        <span className="opacity-40">·</span>
        <span>2-year UK warranty</span>
        <span className="opacity-40 hidden sm:inline">·</span>
        <span className="hidden sm:inline">Expert support</span>
      </div>
    </div>
  );
}
