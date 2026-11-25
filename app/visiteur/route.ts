import { COOKIE_VISITEUR } from "@/lib/profil";

// Lien à partager aux testeurs : /visiteur → tableau de bord sans nom ni prénom.
// /visiteur?sortir → retour au profil normal.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sortir = url.searchParams.has("sortir");
  const res = Response.redirect(new URL("/dashboard", req.url), 307);
  const headers = new Headers(res.headers);
  headers.append(
    "Set-Cookie",
    sortir
      ? `${COOKIE_VISITEUR}=; Path=/; Max-Age=0; SameSite=Lax`
      : `${COOKIE_VISITEUR}=1; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax`,
  );
  return new Response(null, { status: 307, headers });
}
