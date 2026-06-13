// Apply schema.sql then seed.sql to the AXIOM tracking DB.
// Usage: node apply.mjs   (needs DATABASE_URL / POSTGRES_URL)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeClient } from "./db.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const client = makeClient();

try {
  await client.connect();
  for (const file of ["schema.sql", "seed.sql"]) {
    const sql = readFileSync(join(here, file), "utf8");
    await client.query(sql);
    console.log(`✓ applied ${file}`);
  }
  const { rows } = await client.query(
    "select count(*)::int as phases from phases"
  );
  const { rows: f } = await client.query(
    "select count(*)::int as features from features"
  );
  console.log(`✓ done — ${rows[0].phases} phases, ${f[0].features} features tracked`);
} catch (e) {
  console.error("✗ apply failed:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
