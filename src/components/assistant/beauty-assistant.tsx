"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, RotateCcw, Send, Sparkles, X } from "lucide-react";
import type { CardProduct } from "@/lib/consultant/types";

const START_TOKEN = "__START__";

interface Msg {
  role: "user" | "assistant";
  content: string;
  chips?: string[];
  recs?: CardProduct[];
  reasons?: Record<string, string>;
}

interface ApiReply {
  message: string;
  chips: string[];
  recommendations: string[];
  reasons?: Record<string, string>;
  done: boolean;
  provider: string;
}

function Smiley({ className = "", wink = false }: { className?: string; wink?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
        <circle className="rosy-eye" cx="23" cy="26" r="3.4" fill="currentColor" stroke="none" />
        {wink ? (
          <path d="M37 26h8" />
        ) : (
          <circle className="rosy-eye" cx="41" cy="26" r="3.4" fill="currentColor" stroke="none" />
        )}
        <path d="M20 38c3.2 5 7.4 7.5 12.1 7.5S41 43 44 38" />
      </g>
      <circle cx="17" cy="34" r="4" fill="rgba(255,255,255,0.75)" opacity="0.25" />
      <circle cx="47" cy="34" r="4" fill="rgba(255,255,255,0.75)" opacity="0.25" />
    </svg>
  );
}

function RecCard({ p, reason }: { p: CardProduct; reason?: string }) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <div className="msg-in flex items-center gap-3 rounded-2xl border border-rose-100 bg-white p-2.5 shadow-[0_6px_18px_-8px_rgba(190,24,93,0.25)]">
      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-rose-50">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        {discount > 0 && (
          <span className="absolute right-0.5 top-0.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-snug text-neutral-800">{p.name}</p>
        {reason ? (
          <p className="mt-0.5 truncate text-[11px] font-medium text-rose-500">{reason}</p>
        ) : (
          <p className="mt-0.5 text-[11px] capitalize text-neutral-400">{p.subcategory}</p>
        )}
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-rose-700">{p.price} EGP</span>
          {p.oldPrice ? (
            <span className="text-[11px] text-neutral-400 line-through">{p.oldPrice}</span>
          ) : null}
        </p>
      </div>
      <a
        href={`#p-${p.id}`}
        onClick={() => window.dispatchEvent(new CustomEvent("rosy:close"))}
        aria-label={`View ${p.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
      >
        <ArrowUpRight size={15} strokeWidth={2.4} />
      </a>
    </div>
  );
}

export default function BeautyAssistant({ products }: { products: CardProduct[] }) {
  const [open, setOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<string>("");
  const [cloud, setCloud] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  /* ------------------------------ messaging ------------------------------ */
  const ask = useCallback(
    async (history: { role: "user" | "assistant"; content: string }[]) => {
      setTyping(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = (await res.json()) as ApiReply;
        const recs = (data.recommendations || [])
          .map((id) => byId.get(id))
          .filter((p): p is CardProduct => Boolean(p));
        setMsgs((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            chips: data.chips?.length ? data.chips : undefined,
            recs: recs.length ? recs : undefined,
            reasons: data.reasons,
          },
        ]);
        if (data.provider) setProvider(data.provider);
      } catch {
        setMsgs((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry — a small connection hiccup. Could you try that again?" },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [byId],
  );

  const send = useCallback(
    (text: string, hidden = false, base?: Msg[]) => {
      const history = [...(base ?? msgs).map((m) => ({ role: m.role, content: m.content })), { role: "user" as const, content: text }];
      if (!hidden) setMsgs((prev) => [...prev, { role: "user", content: text }]);
      void ask(history);
    },
    [msgs, ask],
  );

  const restart = useCallback(() => {
    setMsgs([]);
    send(START_TOKEN, true, []);
  }, [send]);

  /* ------------------------------ open / close ---------------------------- */
  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);
    window.addEventListener("rosy:open", openHandler);
    window.addEventListener("rosy:close", closeHandler);
    const keyHandler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("rosy:open", openHandler);
      window.removeEventListener("rosy:close", closeHandler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);

  useEffect(() => {
    if (open && !booted) {
      setBooted(true);
      send(START_TOKEN, true);
      setTimeout(() => inputRef.current?.focus(), 450);
    }
  }, [open, booted, send]);

  /* ------------------------------ cloud cycle ----------------------------- */
  useEffect(() => {
    if (open || booted) {
      setCloud(false);
      return;
    }
    let alive = true;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    const cycle = () => {
      t1 = setTimeout(() => {
        if (!alive) return;
        setCloud(true);
        t2 = setTimeout(() => {
          if (!alive) return;
          setCloud(false);
          cycle();
        }, 6000);
      }, 1600);
    };
    cycle();
    return () => {
      alive = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, booted]);

  /* ------------------------------ autoscroll ------------------------------ */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const submit = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    send(text);
  };

  const lastIdx = msgs.length - 1;

  return (
    <>
      {/* ------------------------------ chat panel ----------------------------- */}
      <section
        role="dialog"
        aria-label="Rosy — beauty consultant"
        className={`fixed bottom-24 left-3 z-50 flex h-[min(74vh,620px)] w-[min(92vw,392px)] origin-bottom-left flex-col overflow-hidden rounded-[26px] border border-rose-100 bg-[#fff9fa] shadow-[0_32px_90px_-18px_rgba(190,24,93,0.45)] transition-all duration-300 ease-[cubic-bezier(.34,1.4,.44,1)] sm:left-5 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-[.92] opacity-0"
        }`}
      >
        {/* header */}
        <header className="relative flex items-center gap-3 bg-gradient-to-r from-rose-500 via-rose-500 to-pink-500 px-4 py-3.5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
            <Smiley className="h-7 w-7 text-white" wink={msgs.some((m) => m.recs?.length)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[17px] font-semibold leading-tight">Rosy</p>
            <p className="flex items-center gap-1.5 text-[11px] text-white/85">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
              Your beauty consultant{provider ? ` · ${provider}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            aria-label="Restart consultation"
            className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="rounded-full p-2 text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <X size={17} />
          </button>
        </header>

        {/* messages */}
        <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
          {msgs.map((m, i) => (
            <div key={i} className={`msg-in flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                dir="auto"
                className={`max-w-[85%] px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white"
                    : "rounded-2xl rounded-tl-sm border border-rose-100 bg-white text-neutral-700"
                }`}
              >
                {m.content}
              </div>

              {m.recs?.length ? (
                <div className="mt-2 w-full space-y-2">
                  {m.recs.map((p) => (
                    <RecCard key={p.id} p={p} reason={m.reasons?.[p.id]} />
                  ))}
                </div>
              ) : null}

              {i === lastIdx && m.chips?.length && !typing ? (
                <div dir="auto" className="mt-2 flex max-w-[92%] flex-wrap gap-1.5">
                  {m.chips.map((c, j) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => send(c)}
                      style={{ animationDelay: `${j * 55}ms` }}
                      className="chip-in rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-medium text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-600 hover:text-white"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {typing ? (
            <div className="msg-in flex items-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-rose-100 bg-white px-4 py-3 shadow-sm">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          ) : null}
        </div>

        {/* input */}
        <footer className="border-t border-rose-100 bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Type your answer..."
              aria-label="Type your answer"
              dir="auto"
              className="h-11 flex-1 rounded-full border border-rose-100 bg-[#fff5f7] px-4 text-[13.5px] text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
            <button
              type="button"
              onClick={submit}
              disabled={typing || !input.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={16} strokeWidth={2.4} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] tracking-wide text-neutral-400">
            Personalized picks from the live catalog · guidance, not medical advice
          </p>
        </footer>
      </section>

      {/* ------------------------------- fab + cloud ---------------------------- */}
      <div
        className="fixed bottom-5 left-4 z-50 sm:left-6"
        onMouseEnter={() => !open && booted && setCloud(true)}
        onMouseLeave={() => !open && booted && setCloud(false)}
      >
        {/* cloud */}
        <div
          className={`absolute bottom-full left-1 mb-3 w-max origin-bottom-left transition-all duration-300 ${
            cloud && !open ? "cloud-pop opacity-100" : "pointer-events-none translate-y-2 scale-75 opacity-0"
          }`}
        >
          <div className="relative flex items-center gap-2 rounded-2xl rounded-bl-md border border-rose-100 bg-white px-4 py-2.5 shadow-[0_14px_36px_-10px_rgba(190,24,93,0.35)]">
            <Sparkles size={14} className="text-rose-400" />
            <span className="text-[13px] font-semibold text-neutral-700">Can I help you?</span>
            <span className="absolute -bottom-[5px] left-4 h-2.5 w-2.5 rounded-full border border-rose-100 bg-white" />
            <span className="absolute -bottom-[12px] left-[11px] h-1.5 w-1.5 rounded-full border border-rose-100 bg-white" />
          </div>
        </div>

        {/* fab */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close beauty consultant" : "Open beauty consultant"}
          className="group relative flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600 text-white shadow-[0_18px_40px_-8px_rgba(225,29,116,0.55)] transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          <span className="soft-ping absolute inset-0 rounded-full bg-rose-400" />
          <span
            className={`absolute transition-all duration-300 ${open ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
          >
            <Smiley className="floating-face h-9 w-9" />
          </span>
          <X
            size={24}
            strokeWidth={2.6}
            className={`absolute transition-all duration-300 ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
          />
        </button>
      </div>
    </>
  );
}
