/**
 * Introspect OLD_DATABASE_URL — READ-ONLY. Lists columns of every table.
 * Only SELECT statements against information_schema.
 */
import { neon } from "@neondatabase/serverless";

const OLD = process.env.OLD_DATABASE_URL;
if (!OLD) {
  console.error("OLD_DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(OLD) as unknown as (q: string) => Promise<Array<Record<string, unknown>>>;

async function main() {
  const tables = (await sql(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  )) as Array<{ table_name: string }>;

  for (const { table_name } of tables) {
    const cols = (await sql(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='${table_name}' ORDER BY ordinal_position`
    )) as Array<{ column_name: string; data_type: string; is_nullable: string }>;
    console.log(`\n${table_name} (${cols.length} cols):`);
    for (const c of cols) {
      console.log(`  ${c.column_name.padEnd(26)} ${c.data_type.padEnd(26)} ${c.is_nullable === "YES" ? "null" : "not-null"}`);
    }
  }
}

main().catch((e) => {
  const m = e instanceof Error ? e.message : String(e);
  console.error(m.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgres://***"));
  process.exit(1);
});
