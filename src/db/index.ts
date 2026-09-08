import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

// Keep the database client safe to import during Next.js build-time route
// analysis. Vercel may build before runtime environment variables are
// available; actual database access still requires DATABASE_URL.
export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool(databaseUrl ? { connectionString: databaseUrl } : {});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
