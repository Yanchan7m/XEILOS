"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { scriptedReply } from "@/lib/scripted-chat";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS_BY_MODULE: Record<string, string[]> = {
  "Stratégie d'entreprise": [
    "Donne un exemple concret de SWOT",
    "Différence avec PESTEL ?",
    "Quand utiliser les 5 Forces de Porter ?",
  ],
  "Optimisation des processus": [
    "DMAIC vs PDCA en pratique ?",
    "Donne un cas Lean concret",
    "C'est quoi les 7 mudas ?",
  ],
  "Parties prenantes": [
    "Comment classer une partie prenante ?",
    "Exemple matrice influence × intérêt",
  ],
  "Diagnostic de performance": [
    "Détaille les 4 perspectives du Balanced Scorecard",
    "Différence KPI financier vs opérationnel ?",
  ],
  "KPI & pilotage": [
    "Explique SMART avec un exemple",
    "Quels outils pour suivre des KPI ?",
  ],
  "Analyse technique · Trading": [
    "Comment trader une consolidation ?",
    "Différence range vs tendance ?",
    "C'est quoi un breakout fiable ?",
  ],
};

const FALLBACK_SUGGESTIONS = [
  "Donne-moi un exemple concret",
  "Comment l'appliquer en entreprise ?",
];

type Props = {
  module: string;
};

export default function AskYanInline({ module }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = SUGGESTIONS_BY_MODULE[module] ?? FALLBACK_SUGGESTIONS;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const turnIndex = messages.filter((m) => m.role === "user").length;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const reply = scriptedReply(trimmed, turnIndex);

    await new Promise((r) => setTimeout(r, 380 + Math.random() * 320));

    let acc = "";
    for (let i = 0; i < reply.length; i++) {
      acc += reply[i];
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: acc };
        return copy;
      });
      const delay = reply[i] === " " ? 6 : 12 + Math.random() * 10;
      await new Promise((r) => setTimeout(r, delay));
    }

    setBusy(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--ink)] shadow-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <span className="relative inline-flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-[var(--border)]">
          <Image
            src="/agent-face.png"
            alt=""
            width={20}
            height={20}
            className="h-full w-full object-cover"
          />
        </span>
        Demander à Xeilosia plus de détails
        <span className="text-[var(--muted)]">↓</span>
      </button>
    );
  }

  return (
    <div className="fade-up mt-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        <span className="relative inline-flex h-6 w-6 overflow-hidden rounded-full ring-1 ring-[var(--accent)]/40">
          <Image
            src="/agent-face.png"
            alt=""
            width={24}
            height={24}
            className="h-full w-full object-cover"
          />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[var(--ink)]">Xeilosia</span>
          <span className="text-[10px] text-[var(--muted)]">
            Tuteur IA · {module}
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto rounded-full px-2 py-0.5 text-xs text-[var(--muted)] transition hover:text-[var(--ink)]"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin max-h-56 space-y-2.5 overflow-y-auto px-3 py-3"
      >
        {messages.length === 0 && (
          <div className="text-xs text-[var(--muted)]">
            Pose-moi une question sur ce concept, ou choisis ci-dessous.
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content || (m.role === "assistant" && busy ? <Dots /> : "")}
          </Bubble>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-[var(--border)] px-2 py-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Pose ta question sur ${module}…`}
          className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs outline-none transition focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[var(--ink)] text-white"
            : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.3s]" />
      <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.15s]" />
      <span className="h-1 w-1 animate-bounce rounded-full bg-[var(--muted)]" />
    </span>
  );
}
