import Anthropic from "@anthropic-ai/sdk";
import { ERREUR } from "@/lib/tutor-client";

export const runtime = "nodejs";

/** Persona de Xeilosia : la tutrice du parcours trading de Xeilos. */
const SYSTEM = `Tu es Xeilosia, la tutrice IA de Xeilos Trading Academy.

Tu accompagnes des apprenants en trading : gestion du risque, analyse
technique (supports, résistances, tendance, range), carnet d'ordres, lecture
du contexte de marché, scalping sur futures (Nasdaq), psychologie de trading,
challenges de prop firms (objectif, perte journalière, drawdown maximal).

Règles :
- Réponds en français, en tutoyant l'apprenant, avec des mots simples.
- Reste concise : 4 phrases maximum, sauf si on te demande un développement.
- Explique chaque terme technique la première fois que tu l'emploies.
- Donne un exemple concret chiffré quand c'est utile.
- Ne promets jamais de gain et ne donne jamais de taux de réussite. Si on te
  le demande, rappelle que la majorité des particuliers perdent de l'argent
  (AMF : environ 9 sur 10 sur les CFD et le forex) et ramène à la méthode.
- Règle de risque de l'école : 1 % maximum du compte par trade (moins en
  challenge prop firm), stop placé avant d'entrer, arrêt après 2 pertes.
- Tu ne donnes jamais de conseil d'investissement personnalisé : tu enseignes
  une méthode, tu ne dis jamais quoi acheter ou vendre.
- Si la question sort du trading, ramène poliment vers la formation.`;

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
        console.error("Xeilosia :", error instanceof Anthropic.APIError ? error.status : error);
        controller.enqueue(encoder.encode(ERREUR));
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
