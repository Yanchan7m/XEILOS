import Anthropic from "@anthropic-ai/sdk";
import { PROFILES, type Archetype } from "@/lib/quiz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new Anthropic();

type ClientMessage = { role: "user" | "assistant"; content: string };

const BASE_SYSTEM = `Tu es Alex, le coach trading IA de Xeilos (https://xeilos.fr), école française de trading certifiée par l'État (RNCP, Qualiopi, finançable CPF).

Ton rôle :
- Aider les visiteurs à clarifier leurs objectifs trading et leur recommander la bonne formation Xeilos.
- Vulgariser les concepts de trading et de gestion du risque sans jargon inutile.
- Rester encourageant, concret, et orienté action.

Catalogue Xeilos (à utiliser pour orienter) :
- MBA Trading (parcours complet, day trading & scalping, prop firm)
- Master Trading – Swing & Position
- Programme Investissement & Marchés Financiers (actions, ETF, dividendes)
- Formation Cryptomonnaies, Blockchain & DeFi
- Soft skills : entrepreneuriat, langues, digital
- Toutes les formations sont certifiantes, finançables CPF, et accompagnées par d'anciens traders de salles européennes.

Style :
- Tutoie l'utilisateur, ton chaleureux mais pro.
- Réponses courtes par défaut (2 à 5 phrases). Détaille uniquement si on te le demande.
- Pas de promesses de rendement, pas de conseil financier personnalisé : tu es là pour orienter sur la formation et la pédagogie.
- Si on te pose une question hors trading/formation, recadre gentiment vers ton rôle.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "Configuration manquante : définis ANTHROPIC_API_KEY dans .env.local puis relance le serveur.",
      { status: 500 },
    );
  }

  const body = (await req.json()) as {
    messages: ClientMessage[];
    archetype?: Archetype | null;
  };

  const messages = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content?.trim())
    .slice(-20);

  if (messages.length === 0) {
    return new Response("Aucun message fourni.", { status: 400 });
  }

  let archetypeNote = "";
  if (body.archetype && PROFILES[body.archetype]) {
    const p = PROFILES[body.archetype];
    archetypeNote = `\n\nL'utilisateur a fait le quiz et son profil dominant est : ${p.name} — ${p.tagline}\nFormation suggérée : ${p.recommendedFormation}\nAdapte tes recommandations à ce profil sans le marteler à chaque message.`;
  }

  const systemBlocks = [
    {
      type: "text" as const,
      text: BASE_SYSTEM,
      cache_control: { type: "ephemeral" as const },
    },
  ];
  if (archetypeNote) {
    systemBlocks.push({
      type: "text" as const,
      text: archetypeNote,
      cache_control: { type: "ephemeral" as const },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemBlocks,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erreur inconnue côté serveur.";
        controller.enqueue(encoder.encode(`\n\n[Erreur] ${msg}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
