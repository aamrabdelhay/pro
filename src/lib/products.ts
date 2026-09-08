import { db, ensureDatabase } from "@/db";
import { products } from "@/db/schema";
import type { ProductLite } from "@/lib/consultant/types";

export async function getAllProducts(): Promise<ProductLite[]> {
  await ensureDatabase();
  const rows = await db.select().from(products);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory,
    description: r.description,
    price: r.price,
    oldPrice: r.oldPrice ?? null,
    image: r.image,
    tags: Array.isArray(r.tags) ? r.tags : [],
    rating: Number(r.rating),
    reviews: r.reviews,
    badge: r.badge ?? null,
  }));
}
