import {
  Award,
  Flower2,
  Languages,
  ListChecks,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import BeautyAssistant from "@/components/assistant/beauty-assistant";
import { StoreCTA } from "@/components/store-cta";
import { getAllProducts } from "@/lib/products";
import type { CardProduct, ProductLite } from "@/lib/consultant/types";

export const dynamic = "force-dynamic";

const CATEGORIES: { key: "skin" | "hair" | "body"; title: string; sub: string }[] = [
  { key: "skin", title: "Skincare", sub: "Serums, creams and protection tuned to your skin type" },
  { key: "hair", title: "Haircare", sub: "Care for every texture — straight, wavy, curly and coily" },
  { key: "body", title: "Body care", sub: "Deep moisture, glow and fragrance from head to toe" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-rose-100 text-rose-100"}
        />
      ))}
    </span>
  );
}

function ProductCard({ p }: { p: ProductLite }) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <article
      id={`p-${p.id}`}
      className="group scroll-mt-28 overflow-hidden rounded-3xl border border-rose-100 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(190,24,93,0.3)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-blush-deep">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        {p.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-rose-100 bg-white/90 px-3 py-1 text-[11px] font-semibold text-rose-700 backdrop-blur">
            {p.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
          {p.category === "skin" ? "Skincare" : p.category === "hair" ? "Haircare" : "Body care"} · {p.subcategory}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-wine">{p.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">{p.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-rose-600">{p.price} EGP</span>
            {p.oldPrice ? <span className="text-xs text-neutral-400 line-through">{p.oldPrice} EGP</span> : null}
          </p>
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <Stars rating={p.rating} />
            {p.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  let products: ProductLite[] = [];
  try {
    products = await getAllProducts();
  } catch (e) {
    console.error("[home] products unavailable:", e);
  }
  const heroPicks = [products[0], products[8], products[4]].filter(Boolean) as ProductLite[];
  const cards: CardProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    badge: p.badge,
    rating: p.rating,
  }));

  return (
    <main className="min-h-screen overflow-x-clip">
      {/* ---------------------------------- nav ---------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white">
              <Flower2 size={18} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-wine">Safa Rosy</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <a href="#skin" className="transition hover:text-rose-600">Skincare</a>
            <a href="#hair" className="transition hover:text-rose-600">Haircare</a>
            <a href="#body" className="transition hover:text-rose-600">Body care</a>
            <a href="#how" className="transition hover:text-rose-600">How it works</a>
          </nav>
          <StoreCTA className="rounded-full bg-wine px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-wine-dark">
            Consult Rosy
          </StoreCTA>
        </div>
      </header>

      {/* --------------------------------- hero ---------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-rose-700 shadow-sm">
              <Sparkles size={13} className="text-rose-500" />
              Free AI beauty consultation — skin, hair &amp; body
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.04] tracking-tight text-wine">
              Beauty, decoded
              <br />
              <em className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text italic text-transparent">
                for you.
              </em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-600 md:text-lg">
              Answer a few smart questions — your skin type, hair texture, color, concerns — and Rosy,
              our consultant, matches you with the right products and live offers from the catalog.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StoreCTA className="group rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-10px_rgba(225,29,116,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-12px_rgba(225,29,116,0.7)]">
                Find my routine — it takes a minute
              </StoreCTA>
              <a
                href="#skin"
                className="rounded-full border border-rose-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-wine transition hover:border-rose-400 hover:text-rose-600"
              >
                Shop best sellers
              </a>
            </div>
            <dl className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
              {[
                { icon: Award, k: "19", v: "curated products" },
                { icon: Languages, k: "2", v: "languages, auto-detected" },
                { icon: Wallet, k: "0 EGP", v: "consultation fee" },
              ].map(({ icon: Icon, k, v }) => (
                <div key={v} className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                    <Icon size={16} />
                  </span>
                  <p className="leading-tight">
                    <span className="block font-display text-lg font-bold text-wine">{k}</span>
                    <span className="block text-xs text-neutral-500">{v}</span>
                  </p>
                </div>
              ))}
            </dl>
          </div>

          {/* floating product collage */}
          <div className="relative mx-auto hidden h-[480px] w-full max-w-md sm:block">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-rose-200/60 to-pink-100/40 blur-2xl" />
            {heroPicks.map((p, i) => {
              const spots = [
                { cls: "left-0 top-6 w-[52%] -rotate-6", rot: "-6deg", delay: "0s" },
                { cls: "right-0 top-24 w-[46%] rotate-3", rot: "3deg", delay: "1.1s" },
                { cls: "bottom-2 left-[22%] w-[48%] rotate-6", rot: "6deg", delay: "2.2s" },
              ][i];
              return (
                <figure
                  key={p.id}
                  style={{ ["--rot" as string]: spots.rot, animationDelay: spots.delay }}
                  className={`floaty absolute ${spots.cls} overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-[0_28px_60px_-18px_rgba(190,24,93,0.35)]`}
                >
                  <img src={p.image} alt={p.name} className="aspect-[3/4] w-full object-cover" />
                  <figcaption className="flex items-center justify-between gap-2 bg-white/95 px-4 py-2.5 backdrop-blur">
                    <span className="truncate text-xs font-semibold text-wine">{p.name}</span>
                    <span className="shrink-0 text-xs font-bold text-rose-600">{p.price} EGP</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        {/* marquee */}
        <div className="relative border-y border-wine/10 bg-wine py-3.5 text-rose-50">
          <div className="flex overflow-hidden">
            <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10 [&>span]:whitespace-nowrap [&>span]:text-[13px] [&>span]:font-semibold [&>span]:tracking-wide">
              {Array.from({ length: 2 }).flatMap((_, dup) =>
                [
                  "Free AI consultation",
                  "Skin · Hair · Body",
                  "Personalized in about a minute",
                  "Live offers included",
                  "No account needed",
                  "Professional, friendly guidance",
                ].map((text, i) => (
                  <span key={`${dup}-${i}`} className="flex items-center gap-10">
                    {text}
                    <Flower2 size={13} className="text-rose-300" />
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ how it works ------------------------------ */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-rose-500">How it works</p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-wine md:text-4xl">
          Three steps to your perfect match
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              step: "01",
              title: "Say hi to Rosy",
              body: "Tap the smiling face on the left — a friendly consultant pops up, never pushy, always professional.",
            },
            {
              icon: ListChecks,
              step: "02",
              title: "Answer smart questions",
              body: "Skin type and tone? Hair texture and color? Concerns? The questions adapt intelligently to your answers.",
            },
            {
              icon: ShoppingBag,
              step: "03",
              title: "Get matched + offers",
              body: "Rosy reads the live catalog and recommends the best-fitting products — including whatever is on offer right now.",
            },
          ].map(({ icon: Icon, step, title, body }) => (
            <article
              key={step}
              className="group relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(190,24,93,0.28)]"
            >
              <span className="absolute -right-3 -top-6 font-display text-[92px] font-bold leading-none text-rose-50 transition group-hover:text-rose-100/80">
                {step}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-md">
                <Icon size={20} />
              </span>
              <h3 className="relative mt-5 font-display text-xl font-semibold text-wine">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-neutral-500">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* -------------------------------- products ------------------------------- */}
      {CATEGORIES.map(({ key, title, sub }, ci) => {
        const list = products.filter((p) => p.category === key);
        if (!list.length) return null;
        return (
          <section
            key={key}
            id={key}
            className={`scroll-mt-20 py-16 ${ci % 2 === 0 ? "bg-white" : "bg-blush"}`}
          >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-500">
                    {String(ci + 1).padStart(2, "0")} — Collection
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-wine md:text-4xl">{title}</h2>
                  <p className="mt-2 max-w-lg text-sm text-neutral-500">{sub}</p>
                </div>
                <StoreCTA className="rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:border-rose-500 hover:bg-rose-600 hover:text-white">
                  Not sure? Ask Rosy
                </StoreCTA>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ------------------------------ consult band ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-wine via-[#7a1a38] to-rose-700 px-6 py-16 text-center text-white md:py-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-rose-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-pink-300/20 blur-3xl" />
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-200">Undecided?</p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl font-semibold leading-tight md:text-5xl">
            Let Rosy read your answers and pick <em className="italic text-rose-200">exactly</em> what fits.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-rose-100/90 md:text-base">
            No forms, no guessing, no endless scrolling — a one-minute conversation that ends with products
            matched to your skin, hair, and budget.
          </p>
          <StoreCTA className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-bold text-rose-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-rose-50">
            Start my free consultation
          </StoreCTA>
        </div>
      </section>

      {/* --------------------------------- footer --------------------------------- */}
      <footer className="border-t border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-10 text-center md:flex-row md:text-left lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white">
              <Flower2 size={18} />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-wine">Safa Rosy</p>
              <p className="text-xs text-neutral-400">Beauty, decoded for you.</p>
            </div>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-neutral-400">
            Prototype storefront demonstrating the AI consultation experience designed for safa-rosy.vercel.app.
            Recommendations are guidance, not medical advice.
          </p>
          <nav className="flex gap-6 text-sm text-neutral-500">
            <a href="#skin" className="transition hover:text-rose-600">Skincare</a>
            <a href="#hair" className="transition hover:text-rose-600">Haircare</a>
            <a href="#body" className="transition hover:text-rose-600">Body care</a>
          </nav>
        </div>
      </footer>

      {/* ------------------------------ assistant widget ------------------------------ */}
      <BeautyAssistant products={cards} />
    </main>
  );
}
