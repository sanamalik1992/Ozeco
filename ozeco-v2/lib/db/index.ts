import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const rawSql = neon(connectionString);

/**
 * Neon's HTTP proxy can return transient 503s ("DNS cache overflow")
 * under burst load. Wrap the client with exponential backoff so a single
 * flaky request doesn't fail a server render or a build-time prerender.
 */
function isTransient(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b503\b|cache overflow|ETIMED|ECONN|network|reset|timeout/i.test(msg);
}

type NeonArgs = Parameters<typeof rawSql>;
type NeonReturn = ReturnType<typeof rawSql>;

async function retryingSqlCore(...args: NeonArgs): Promise<Awaited<NeonReturn>> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return (await (rawSql as (...a: NeonArgs) => NeonReturn)(...args)) as Awaited<NeonReturn>;
    } catch (err) {
      lastErr = err;
      if (attempt === 5 || !isTransient(err)) throw err;
      const delay = 200 * attempt * attempt;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// Preserve the `.transaction()` method on the wrapped callable so the full API is intact.
const retryingSql = retryingSqlCore as unknown as NeonQueryFunction<false, false>;
(retryingSql as unknown as { transaction: typeof rawSql.transaction }).transaction =
  rawSql.transaction.bind(rawSql);

export const db = drizzle(retryingSql, { schema });

export * from "./schema";
