import type { ChatMessage, ConsultantReply, ProductLite } from "./types";

/**
 * Free-tier-friendly LLM orchestration.
 * Priority: Groq (free key at console.groq.com) → Gemini (free key at
 * aistudio.google.com) → OpenAI. All via OpenAI-compatible endpoints,
 * so no SDKs and no paid contracts are required.
 */

interface Provider {
  name: string;
  url: string;
  key: string;
  models: string[];
  jsonMode: boolean;
}

export function getProvider(): Provider | null {
  const groq = process.env.GROQ_API_KEY;
  if (groq)
    return {
      name: "Groq · Llama 3.3",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: groq,
      models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
      jsonMode: true,
    };
  const gemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (gemini)
    return {
      name: "Gemini · Flash",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: gemini,
      models: ["gemini-2.0-flash", "gemini-1.5-flash"],
      jsonMode: false,
    };
  const openai = process.env.OPENAI_API_KEY;
  if (openai)
    return {
      name: "OpenAI",
      url: "https://api.openai.com/v1/chat/completions",
      key: openai,
      models: ["gpt-4o-mini"],
      jsonMode: true,
    };
  return null;
}

function systemPrompt(catalog: string) {
  return `You are "Rosy", the resident beauty consultant of Safa Rosy, an online beauty store. You chat inside a small website widget to help each shopper find the perfect products.

PERSONA — strict rules:
- Professional, warm, respectful. Like a trained beauty advisor in a boutique.
- NEVER flirt. No pet names, no compliments on looks, no "habibti", "beautiful", "gorgeous". Nothing suggestive.
- No emojis.
- Keep every message under 60 words. Be human and natural, not robotic.
- Default language: English. If the user writes in another language (e.g., Arabic), switch fully to that language. For Arabic use polite, friendly modern Arabic (a soft Egyptian touch is fine, but stay professional).

TASK — run a short smart consultation:
1. A user message equal to "__START__" means the widget just opened: greet briefly and ask what they are shopping for (skin, hair, or body care).
2. Then ask ONE smart follow-up question at a time — only what is needed:
   - Skincare: skin type (dry / oily / combination / sensitive / normal), main concern (acne, dark spots or pigmentation, dullness, aging, dehydration...). You may also ask how their skin reacts to the sun (skin tone) when it affects the choice.
   - Haircare: hair type (straight / wavy / curly / coily), whether the hair is colored — and the color if yes — then main concern (hair fall, dandruff or scalp, frizz, dryness or damage, color care...).
   - Body care: the goal (extreme dryness, brightening or even tone, smoothing / exfoliation, firmness, fragrance...).
3. Maximum 4 questions total — fewer when you already have enough.
4. When you have enough, recommend 2–3 products. You may ONLY recommend ids that exist in the CATALOG. Never invent products, prices, ingredients, or claims. In your message briefly explain why the picks fit THEIR answers. If any recommended product has an oldPrice, you may mention it is on offer.
5. After recommending, offer alternatives or a different price point. Keep narrowing based on their replies.

OUTPUT — respond with STRICT JSON only. No markdown fences, no commentary. Exact shape:
{"message": string, "chips": string[], "recommendations": string[], "done": boolean}
- "message": what you say to the shopper.
- "chips": 2–6 very short one-tap answers to YOUR question (same language as the user). Empty array when no quick options fit.
- "recommendations": product ids from the CATALOG. Empty until you recommend.
- "done": true only in the message that delivers the recommendations.

CATALOG (authoritative, JSON):
${catalog}`;
}

function extractJson(text: string): Record<string, unknown> | null {
  const attempt = (s: string) => {
    try {
      return JSON.parse(s) as Record<string, unknown>;
    } catch {
      return null;
    }
  };
  const direct = attempt(text.trim());
  if (direct) return direct;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return attempt(text.slice(start, end + 1));
  return null;
}

export async function consultWithLLM({
  messages,
  products,
  provider,
}: {
  messages: ChatMessage[];
  products: ProductLite[];
  provider: Provider;
}): Promise<ConsultantReply | null> {
  const catalog = JSON.stringify(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      priceEgp: p.price,
      oldPriceEgp: p.oldPrice,
      tags: p.tags,
      description: p.description,
    })),
  );
  const history = messages.slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));

  for (const model of provider.models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25_000);
      const res = await fetch(provider.url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.5,
          max_tokens: 800,
          ...(provider.jsonMode ? { response_format: { type: "json_object" } } : {}),
          messages: [{ role: "system", content: systemPrompt(catalog) }, ...history],
        }),
      }).finally(() => clearTimeout(timeout));

      if (!res.ok) continue;
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) continue;
      const parsed = extractJson(raw);
      if (!parsed || typeof parsed.message !== "string" || !parsed.message.trim()) continue;

      const ids = new Set(products.map((p) => p.id));
      const recommendations = Array.isArray(parsed.recommendations)
        ? (parsed.recommendations as unknown[]).filter((x): x is string => typeof x === "string" && ids.has(x)).slice(0, 4)
        : [];
      const chips = Array.isArray(parsed.chips)
        ? (parsed.chips as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 6)
        : [];
      return {
        message: parsed.message.trim(),
        chips,
        recommendations,
        done: Boolean(parsed.done) && recommendations.length > 0,
      };
    } catch {
      continue; // try next model, local engine is the final safety net
    }
  }
  return null;
}
