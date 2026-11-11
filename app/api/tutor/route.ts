import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
// Une réponse de 4 phrases tient largement en 30 s ; au-delà, on coupe.
export const maxDuration = 30;

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

// ─── PROTECTION (11/11/2026) ─────────────────────────────────────────────
// Le site n'a pas de comptes : sans garde, n'importe qui pouvait appeler cette
// route depuis un script et consommer la clé Anthropic sans limite. Trois
// barrières, du moins cher au plus cher :
//   1. même site seulement (pas d'appel depuis une autre page ni un script naïf) ;
//   2. entrées bornées (taille, nombre, rôles) ;
//   3. limite d'appels par visiteur et par instance.
// Le vrai plafond reste la limite de dépense de la clé dans la console Anthropic.

const MAX_CORPS = 24_000; // octets
const MAX_MESSAGES = 12;
const MAX_CARACTERES = 2_000; // par message
const MAX_TOTAL = 8_000; // sur l'historique envoyé

const FENETRE_MS = 10 * 60_000;
const MAX_PAR_VISITEUR = 20; // questions / 10 min
const MAX_PAR_INSTANCE = 300; // questions / 10 min, tous visiteurs

const appels = new Map<string, number[]>();
let appelsInstance: number[] = [];

function depasse(cle: string, maintenant = Date.now()): boolean {
  const depuis = maintenant - FENETRE_MS;
  appelsInstance = appelsInstance.filter((t) => t > depuis);
  const miens = (appels.get(cle) ?? []).filter((t) => t > depuis);
  if (miens.length >= MAX_PAR_VISITEUR || appelsInstance.length >= MAX_PAR_INSTANCE) {
    appels.set(cle, miens);
    return true;
  }
  miens.push(maintenant);
  appels.set(cle, miens);
  appelsInstance.push(maintenant);
  if (appels.size > 5_000) appels.clear(); // la mémoire de l'instance reste petite
  return false;
}

function memeSite(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origine = request.headers.get("origin");
  const hote = request.headers.get("host");
  if (!origine || !hote) return false;
  try {
    return new URL(origine).host === hote;
  } catch {
    return false;
  }
}

function visiteur(request: Request): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "inconnu"
  );
}

/** Un nom de module affichable, sans rien qui ressemble à une consigne. */
function nomDeModule(m: unknown): string | null {
  if (typeof m !== "string") return null;
  const propre = m.replace(/[^\p{L}\p{N} &'’,.()/-]/gu, " ").replace(/\s+/g, " ").trim();
  return propre.length > 0 && propre.length <= 60 ? propre : null;
}

const refus = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Pas de clé : le client bascule sur les réponses scriptées.
    return refus("no_api_key", 503);
  }
  if (!memeSite(request)) return refus("forbidden", 403);
  if (depasse(visiteur(request))) return refus("rate_limited", 429);

  const brut = await request.text().catch(() => "");
  if (brut.length > MAX_CORPS) return refus("too_large", 413);

  let body: unknown;
  try {
    body = JSON.parse(brut);
  } catch {
    return refus("bad_json", 400);
  }
  const { messages, weakModules } = (body ?? {}) as { messages?: unknown; weakModules?: unknown };

  const history: Anthropic.Beta.BetaMessageParam[] = (Array.isArray(messages) ? messages : [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CARACTERES) }));

  // L'API veut un premier message de l'apprenant, et la question en dernier.
  while (history.length && history[0].role !== "user") history.shift();
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return refus("empty", 400);
  }
  const total = history.reduce((n, m) => n + (m.content as string).length, 0);
  if (total > MAX_TOTAL) return refus("too_large", 413);

  // Les modules ratés : une courte liste de noms, jamais du texte libre glissé
  // dans les consignes.
  const faibles = (Array.isArray(weakModules) ? weakModules : [])
    .map(nomDeModule)
    .filter((m): m is string => m !== null)
    .slice(0, 6);
  const weak = faibles.length
    ? `\n\nContexte : l'apprenant vient de se tromper sur ${faibles.join(", ")}. Reviens dessus quand c'est pertinent.`
    : "";

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const message = client.beta.messages.stream({
          model: "claude-opus-5-5",
          max_tokens: 1024,
          system: SYSTEM + weak,
          thinking: { type: "adaptive" },
          output_config: { effort: "low" },
          // Si le modèle décline, la même requête repart sur un autre modèle.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
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
        const fin = await message.finalMessage();
        if (fin.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("\nJe ne peux pas répondre à cette question. Reformule-la autour de la formation."),
          );
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
