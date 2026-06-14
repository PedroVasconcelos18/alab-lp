import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de confirmação de e-mail (e recuperação de senha).
 * Quando o usuário clica no link de confirmação do cadastro, o Supabase
 * redireciona para cá com um `code`; trocamos por uma sessão (cookies) e
 * mandamos o usuário para onde deve ir (`next`).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Falha na troca do código → manda para uma página de erro simples.
  return NextResponse.redirect(`${origin}/auth/erro`);
}
