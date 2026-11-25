"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* La base d'Axone, partagée avec XEILOS (25/11/2026) : mêmes comptes, mêmes
   phrases de scalping (journal_axone_docs settings/scalp_phrases), et la table
   push_subscriptions avec app = "xeilos" pour les appareils de cette app.
   Clé « anon » publique : la sécurité vient des règles RLS de la base. */
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mykkmihenjrucdefxxts.supabase.co";
const CLE_ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a2ttaWhlbmpydWNkZWZ4eHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTkxNDQsImV4cCI6MjA5MDYzNTE0NH0.Y7IQCLCvuTIbCZZ89oqeScN35QQlLU7VJFPVuamHfAQ";

// Même clé publique VAPID qu'Axone (le secret vit dans la fonction send-push).
export const VAPID_PUBLIC_KEY = "BNG0xH465u-jUb_WigGT7KuAxcADvW6LUB1ceS7SACdemskrnS6RialxxcP2UDLX5Mdc50CpbV1l6_SvJW9cjB0";
export const URL_SUPABASE = URL_SB;
export const SUPER_ADMIN = "yanchan3@aol.fr";

let client: SupabaseClient | null = null;
export function sb(): SupabaseClient {
  // Clé de stockage à part : ne pas partager la session avec un autre site sur le même domaine.
  client ??= createClient(URL_SB, CLE_ANON, { auth: { storageKey: "xeilos-auth", persistSession: true } });
  return client;
}
