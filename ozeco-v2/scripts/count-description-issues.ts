/**
 * Read-only — scans product descriptions for two data-quality issues:
 *   1. "Electric bike" capitalised mid-sentence (should be lowercase after a word)
 *   2. "Electric Bike" mid-sentence (title-cased noun phrase mid-sentence)
 * Reports counts + offending products for fix-up in the admin panel later.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL missing"); process.exit(1); }
const sql = neon(url) as unknown as (q: string) => Promise<Array<Record<string, unknown>>>;

async function main() {
  const rows = (await sql(
    "SELECT slug, name, description FROM products"
  )) as Array<{ slug: string; name: string; description: string }>;

  // Mid-sentence = not at start of description and not directly after . ? !
  const midSentenceCaps =
    /(?<![.!?]\s)(?<!^)\b(Electric (?:bike|Bike))\b/g;

  let total = 0;
  const perProduct: Array<{ slug: string; hits: string[] }> = [];

  for (const row of rows) {
    const hits: string[] = [];
    let m: RegExpExecArray | null;
    midSentenceCaps.lastIndex = 0;
    while ((m = midSentenceCaps.exec(row.description)) !== null) {
      // skip if it's the very first word of the description
      if (m.index === 0) continue;
      const ctxStart = Math.max(0, m.index - 30);
      const ctxEnd = Math.min(row.description.length, m.index + m[0].length + 30);
      hits.push("…" + row.description.slice(ctxStart, ctxEnd).replace(/\s+/g, " ") + "…");
    }
    if (hits.length > 0) {
      perProduct.push({ slug: row.slug, hits });
      total += hits.length;
    }
  }

  console.log(`Total mid-sentence "Electric bike"/"Electric Bike" caps: ${total}`);
  console.log(`Affected products: ${perProduct.length}/${rows.length}`);
  for (const p of perProduct) {
    console.log(`\n  ${p.slug} (${p.hits.length})`);
    for (const h of p.hits) console.log("    " + h);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
