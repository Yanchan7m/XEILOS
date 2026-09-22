"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { scriptedReply } from "@/lib/scripted-chat";
import { streamTutor, type ChatMessage } from "@/lib/tutor-client";
import { listenOnce, micSupported, speak, speechSupported, stopSpeaking } from "@/lib/voice";

type Message = ChatMessage;

const SUGGESTIONS = [
  "Explique-moi l'analyse SWOT",
  "Différence entre PESTEL et 5 Forces de Porter ?",
  "À quoi sert le Balanced Scorecard ?",
  "Quels sont les modules du Mastère ?",
];

/** D'où vient la dernière réponse : vraie IA ou script de démo. */
type Mode = "unknown" | "ia" | "script";

export default function Chat({ weakModules = [] }: { weakModules?: string[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("unknown");
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canListen, setCanListen] = useState(false);
  const stopListening = useRef<(() => void) | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Les API vocales n'existent qu'au navigateur : on teste après montage.
  useEffect(() => {
    setCanSpeak(speechSupported());
    setCanListen(micSupported());
    return () => stopSpeaking();
  }, []);

  const intro =
    "Salut 👋 Je suis Xeilosia, le tuteur IA du Mastère. Je connais tous les modules : stratégie, KPI, parties prenantes, optimisation des processus… Demande-moi une explication, une révision ou un QCM.";

  const suggestions = SUGGESTIONS;

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

    const turnIndex = messages.filter((m) => m.role === "user").length;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);

    // Placeholder assistant message we'll stream into
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    let acc = "";
    const push = (chunk: string) => {
      acc += chunk;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: acc };
        return copy;
      });
    };

    // 1) Vrai tuteur IA. 2) Repli scripté si la clé API manque ou si ça casse.
    const live = await streamTutor(next, weakModules, push);

    if (live) {
      setMode("ia");
    } else {
      setMode("script");
      const reply = scriptedReply(trimmed, turnIndex);
      await new Promise((r) => setTimeout(r, 450 + Math.random() * 350));
      for (let i = 0; i < reply.length; i++) {
        push(reply[i]);
        // Speed varies a bit; faster on spaces
        const delay = reply[i] === " " ? 8 : 14 + Math.random() * 12;
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // La voix ne doit pas lire les astérisques du Markdown.
    if (voiceOn) speak(acc.replace(/\*+/g, ""));
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function toggleMic() {
    if (listening) {
      stopListening.current?.();
      return;
    }
    const stop = listenOnce(
      (text) => send(text),
      () => {
        setListening(false);
        stopListening.current = null;
      },
    );
    if (stop) {
      stopListening.current = stop;
      setListening(true);
    }
  }

  function toggleVoice() {
    setVoiceOn((on) => {
      if (on) stopSpeaking();
      return !on;
    });
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
              src="/xeilosia-avatar.png"
              alt="Xeilosia, tuteur IA du Mastère"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--success)]" />
        </div>
        <div>
          <div className="text-sm font-semibold">Xeilosia</div>
          <div className="text-xs text-[var(--muted)]">Tuteur IA · Mastère</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {canSpeak && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voiceOn}
              title={voiceOn ? "Couper la voix" : "Xeilosia lit ses réponses"}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                voiceOn
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {voiceOn ? "🔊 Voix" : "🔈 Voix"}
            </button>
          )}
          <div
            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${
              mode === "ia"
                ? "bg-[var(--success)]/15 text-[var(--success)]"
                : "bg-[var(--surface-2)] text-[var(--muted)]"
            }`}
          >
            {mode === "ia" ? "IA en direct" : mode === "script" ? "Démo" : "Live"}
          </div>
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
          placeholder="Pose ta question à Xeilosia…"
          className="scrollbar-thin max-h-32 flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
        />
        {canListen && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={busy}
            title="Poser la question à la voix"
            aria-pressed={listening}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-base transition disabled:opacity-50 ${
              listening
                ? "live-dot border-[var(--accent)] bg-[var(--accent)]/15"
                : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]"
            }`}
          >
            🎙️
          </button>
        )}
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
            src="/xeilosia-avatar.png"
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
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--surface-2)] text-[var(--foreground)]/90 border border-[var(--border)]"
        }`}
      >
        {typeof children === "string" ? <RichText text={children} /> : children}
      </div>
    </div>
  );
}

/**
 * Le modèle écrit en Markdown léger : on rend au moins le gras (**…**) et
 * l'italique (*…*) plutôt que d'afficher les astérisques.
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
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
