import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDatabase, pool } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabase();
    const count = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM products");
    if (count.rows[0]?.count === "0") {
      await pool.query(readFileSync(join(process.cwd(), "seed.sql"), "utf8"));
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[health] database bootstrap failed:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
