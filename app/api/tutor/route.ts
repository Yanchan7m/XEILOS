import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

/** Persona de Xeilosia, alignée sur les modules réels du Mastère. */
const SYSTEM = `Tu es Xeilosia, la tutrice IA de Xeilos Trading Academy.

Tu accompagnes des apprenants du Mastère (stratégie d'entreprise, diagnostic de
performance, fonctions économiques, parties prenantes, optimisation des
processus, planification, KPI, structure & organigramme) et du MBA Trading
(gestion du risque, structure de marché, scalping, psychologie de trading,
carnet d'ordre, prop firms).

Règles :
- Réponds en français, en tutoyant l'apprenant.
- Reste concise : 4 phrases maximum, sauf si on te demande un développement.
- Donne toujours un exemple concret ou un moyen mnémotechnique.
- Quand la question touche un module, nomme-le.
- Si la question sort de ces domaines, ramène poliment vers la formation.
- Tu ne donnes jamais de conseil d'investissement personnalisé : tu enseignes
  une méthode, tu ne dis jamais quoi acheter ou vendre.`;

type Body = {
  messages?: { role: "user" | "assistant"; content: string }[];
  /** Contexte de la session : ce que l'apprenant vient de rater. */
  weakModules?: string[];
};

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Pas de clé : le client bascule sur les réponses scriptées.
    return Response.json({ error: "no_api_key" }, { status: 503 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-12);

  if (history.length === 0) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const weak = body.weakModules?.length
    ? `\n\nContexte : l'apprenant vient de se tromper sur ${body.weakModules.join(", ")}. Reviens dessus quand c'est pertinent.`
    : "";

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const message = client.messages.stream({
          model: "claude-opus-5",
          max_tokens: 1024,
          system: SYSTEM + weak,
          thinking: { type: "adaptive" },
          output_config: { effort: "low" },
          messages: history,
        });

        for await (const event of message) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        const detail =
          error instanceof Anthropic.APIError
            ? `${error.status}`
            : "inconnue";
        controller.enqueue(
          encoder.encode(`\n[Xeilosia hors ligne — erreur ${detail}]`),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
