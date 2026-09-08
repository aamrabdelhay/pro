import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool(databaseUrl ? { connectionString: databaseUrl } : {});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

let schemaReady: Promise<void> | null = null;

export function ensureDatabase(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          subcategory TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          price INTEGER NOT NULL,
          old_price INTEGER,
          image TEXT NOT NULL DEFAULT '',
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
          reviews INTEGER NOT NULL DEFAULT 0,
          badge TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS consultations (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          language TEXT NOT NULL DEFAULT 'en',
          answers JSONB NOT NULL DEFAULT '{}'::jsonb,
          recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
          provider TEXT NOT NULL DEFAULT 'local'
        );
      `)
      .then(() => undefined);
  }
  return schemaReady;
}
