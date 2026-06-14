import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase SEM cookies, para uso em build time / contextos sem request
 * (ex: generateStaticParams). Usa a anon key — só enxerga dados públicos via RLS
 * (posts publicados), que é exatamente o que a geração estática precisa.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
