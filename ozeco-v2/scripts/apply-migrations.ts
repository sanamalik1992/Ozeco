import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

type NeonSql = (query: string) => Promise<unknown>;

async function runWithRetry(sql: NeonSql, stmt: string, attempts = 5) {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await sql(stmt);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (!/503|cache|timeout|ETIMED|ECONN/i.test(msg)) throw err;
      const delay = 500 * i * i;
      console.warn(`  retry ${i}/${attempts} in ${delay}ms — ${msg}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const migrationsDir = join(process.cwd(), "lib/db/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found");
    return;
  }

  const sql = neon(url) as unknown as NeonSql;

  for (const file of files) {
    const fullPath = join(migrationsDir, file);
    const content = readFileSync(fullPath, "utf8");
    const statements = content
      .split(/-->\s*statement-breakpoint/g)
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`Applying ${file} (${statements.length} statements)…`);
    let applied = 0;
    for (const stmt of statements) {
      try {
        await runWithRetry(sql, stmt);
        applied += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`FAILED after retries:\n${stmt}\n-- error: ${msg}`);
        throw err;
      }
    }
    console.log(`  ✓ ${file} (${applied}/${statements.length} applied)`);
  }

  console.log("All migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
