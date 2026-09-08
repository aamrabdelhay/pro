import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // skin | hair | body
  subcategory: text("subcategory").notNull().default(""),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(), // EGP
  oldPrice: integer("old_price"),
  image: text("image").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  rating: numeric("rating", { precision: 2, scale: 1 })
    .notNull()
    .default("4.5"),
  reviews: integer("reviews").notNull().default(0),
  badge: text("badge"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
  language: text("language").notNull().default("en"),
  answers: jsonb("answers").$type<Record<string, string>>().notNull().default({}),
  recommendations: jsonb("recommendations")
    .$type<string[]>()
    .notNull()
    .default([]),
  provider: text("provider").notNull().default("local"),
});
