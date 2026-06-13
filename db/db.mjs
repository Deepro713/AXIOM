// Shared Postgres client for the AXIOM tracking DB.
// Reads the connection string from DATABASE_URL or POSTGRES_URL.
import pg from "pg";

const conn =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.NEON_DATABASE_URL;

if (!conn) {
  console.error(
    "✗ No connection string. Set DATABASE_URL (or POSTGRES_URL).\n" +
      "  e.g. export DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'\n" +
      "  or:  vercel env pull .env.local  &&  source-like load it."
  );
  process.exit(1);
}

export function makeClient() {
  return new pg.Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
  });
}
