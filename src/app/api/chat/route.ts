import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { getAllProducts } from "@/lib/products";
import { localConsult } from "@/lib/consultant/local";
import { consultWithLLM, getProvider } from "@/lib/consultant/llm";
import type { ChatMessage, ConsultantReply } from "@/lib/consultant/types";

export const dynamic = "force-dynamic";

const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);

export async function POST(req: NextRequest) {
  let messages: ChatMessage[] = [];
  try {
    const body = (await req.json()) as { messages?: unknown };
    const raw = Array.isArray(body?.messages) ? (body.messages as unknown[]) : [];
    messages = raw
      .filter(
        (m): m is ChatMessage =>
          typeof m === "object" &&
          m !== null &&
          ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
          typeof (m as ChatMessage).content === "string",
      )
      .slice(-24);
  } catch {
    // fall through with empty history — engines return the greeting
  }

  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  try {
    products = await getAllProducts();
  } catch (e) {
    console.error("[chat] products query failed:", e);
  }

  const provider = getProvider();
  let reply: ConsultantReply | null = null;
  let used = "Local Smart Engine";

  if (provider && products.length) {
    try {
      reply = await consultWithLLM({ messages, products, provider });
      if (reply) used = provider.name;
    } catch (e) {
      console.error("[chat] LLM failed, using local engine:", e);
    }
  }
  if (!reply) reply = localConsult(messages, products);
  if (!products.length) {
    reply = {
      message:
        "Our catalog is being refreshed right now — please check back in a moment and I'll build your routine.",
      chips: [],
      recommendations: [],
      done: false,
    };
  }

  // Persist finished consultations for store analytics (fire and forget best-effort)
  if (reply.done && reply.recommendations.length) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    try {
      await db.insert(consultations).values({
        language: lastUser && hasArabic(lastUser.content) ? "ar" : "en",
        answers: reply.answers ?? {},
        recommendations: reply.recommendations,
        provider: used,
      });
    } catch (e) {
      console.error("[chat] failed to log consultation:", e);
    }
  }

  return NextResponse.json({ ...reply, provider: used });
}
