export default function ProductLoading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-7">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-paper-dim" />
        </div>
        <div className="md:col-span-5 space-y-5 md:pt-4">
          <div className="h-3 w-32 animate-pulse rounded-full bg-paper-dim" />
          <div className="h-12 w-4/5 animate-pulse rounded-lg bg-paper-dim" />
          <div className="h-4 w-40 animate-pulse rounded-full bg-paper-dim" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-paper-dim" />
          <div className="h-12 w-full animate-pulse rounded-full bg-paper-dim" />
        </div>
      </div>
    </section>
  );
}
