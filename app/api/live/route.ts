// Le live YouTube de Xeilos (youtube.com/@xeilostrading), repris de /xeilosapp (unlock747).
// La page /live d'une chaîne pointe vers la vidéo en cours (balise canonical « watch?v= ») et porte
// « isLiveNow »:true pendant la diffusion ; sinon elle pointe vers la chaîne. Un direct prévu mais pas
// encore lancé n'a pas isLiveNow:true. Réponse : { live, id, titre }.
// On ne demande à YouTube qu'une fois par minute au plus : le résultat est gardé en mémoire.

const CHAINE = "https://www.youtube.com/@xeilostrading/live";
const DUREE_MS = 60_000;

type Etat = { live: boolean; id: string | null; titre: string };

let memo: { etat: Etat; le: number } | null = null;

function lireDirect(html: string): Etat {
  const canon = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{6,20})"/);
  if (!canon || !/"isLiveNow":true/.test(html)) return { live: false, id: null, titre: "" };
  const t = html.match(/<meta name="title" content="([^"]*)"/) ?? html.match(/<meta property="og:title" content="([^"]*)"/);
  const titre = (t?.[1] ?? "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  return { live: true, id: canon[1], titre };
}

export async function GET() {
  if (memo && Date.now() - memo.le < DUREE_MS) return Response.json(memo.etat);
  try {
    const r = await fetch(CHAINE, {
      cache: "no-store",
      headers: { "Accept-Language": "fr-FR,fr;q=0.9", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    const etat = lireDirect(await r.text());
    memo = { etat, le: Date.now() };
    return Response.json(etat);
  } catch {
    // YouTube injoignable : on renvoie le dernier état connu, sinon « pas en direct ».
    return Response.json(memo?.etat ?? { live: false, id: null, titre: "" });
  }
}
