"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("err");
      return;
    }
    setStatus("loading");
    try {
      // Phase 3 will wire this to /api/newsletter. For now, accept & show success.
      await new Promise((r) => setTimeout(r, 400));
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <section className="bg-background py-28 md:py-36">
      <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Join Ozeco
        </div>
        <h2 className="mt-3 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl md:text-[56px] text-balance">
          Get £20 off your first bike.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base text-muted-foreground">
          Join 5,000+ UK riders for early access to new models, seasonal offers and route ideas.
        </p>
        {status === "ok" ? (
          <p className="mx-auto mt-10 max-w-md rounded-full bg-accent/10 px-6 py-4 text-sm text-accent">
            Thanks — we&apos;ve emailed your £20 discount code.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-10 flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card pl-5 pr-1 py-1 focus-within:border-ink"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/70"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper disabled:opacity-60"
            >
              {status === "loading" ? "…" : "Sign up"}
              <ArrowRight className="size-4" />
            </button>
          </form>
        )}
        {status === "err" && (
          <p className="mt-3 text-xs text-destructive">
            Please enter a valid email address.
          </p>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
