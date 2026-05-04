"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Archetype } from "@/lib/quiz";
import { PROFILES } from "@/lib/quiz";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS_DEFAULT = [
  "Je débute totalement, par où commencer ?",
  "Quelle formation est éligible CPF ?",
  "Combien de temps pour devenir rentable ?",
  "Différence entre scalping et swing ?",
];

const SUGGESTIONS_BY_ARCHETYPE: Record<Archetype, string[]> = {
  scalper: [
    "À quoi ressemble une journée de scalping ?",
    "Quel matériel pour scalper sérieusement ?",
    "Comment Xeilos forme aux prop firms ?",
  ],
  swing: [
    "Comment construire un plan de trade swing ?",
    "Quels indicateurs vous enseignez ?",
    "Combien de temps par semaine pour le swing ?",
  ],
  investor: [
    "Quelle stratégie ETF / dividendes ?",
    "Comment diversifier mon portefeuille ?",
    "Le programme Investissement, c’est pour qui ?",
  ],
  crypto: [
    "Vous abordez la DeFi en formation ?",
    "Comment sécuriser mes wallets ?",
    "Cycle Bitcoin : ça se trade comment ?",
  ],
};

type Props = {
  archetype: Archetype | null;
};

export default function Chat({ archetype }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const intro = archetype
    ? `Salut 👋 Je suis Alex, ton coach Xeilos. Top, tu es un profil ${PROFILES[archetype].name.toLowerCase()} ! On creuse ton plan d’apprentissage ?`
    : "Salut 👋 Je suis Alex, ton coach IA chez Xeilos. Pose-moi tes questions sur le trading, les formations, ou commence par le quiz juste à gauche.";

  const suggestions = archetype
    ? SUGGESTIONS_BY_ARCHETYPE[archetype]
    : SUGGESTIONS_DEFAULT;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    // Add a placeholder assistant message we'll stream into
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, archetype }),
      });

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Erreur HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue.";
      setError(msg);
      setMessages((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex h-[640px] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="relative">
          <div className="agent-ring h-11 w-11 overflow-hidden rounded-full ring-2 ring-[var(--accent)]/40">
            <Image
              src="/agent-face.png"
              alt="Alex, coach IA Xeilos"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--success)]" />
        </div>
        <div>
          <div className="text-sm font-semibold">Alex</div>
          <div className="text-xs text-[var(--muted)]">Coach trading IA · Xeilos</div>
        </div>
        <div className="ml-auto rounded-full bg-[var(--surface-2)] px-3 py-1 text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Live
        </div>
      </header>

      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-6"
      >
        <Bubble role="assistant">{intro}</Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role}>
            {m.content || (m.role === "assistant" && busy ? <Typing /> : "")}
          </Bubble>
        ))}
        {error && (
          <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-5 py-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-50"
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
        className="flex items-end gap-2 border-t border-[var(--border)] px-4 py-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Pose ta question à Alex…"
          className="scrollbar-thin max-h-32 flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex h-11 items-center gap-2 rounded-2xl bg-[var(--accent)] px-4 text-sm font-medium text-[#04141d] transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className={`fade-up flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--border)]">
          <Image
            src="/agent-face.png"
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-[var(--accent)] text-[#04141d]"
            : "bg-[var(--surface-2)] text-[var(--foreground)]/90 border border-[var(--border)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)]" />
    </span>
  );
}
