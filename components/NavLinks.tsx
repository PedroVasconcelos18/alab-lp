"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Conteúdo interativo do header. Precisa de usePathname (âncoras viram /#...
 * fora da home) e mostra o estado de login. Busca a sessão no browser para que
 * as páginas que usam o Nav (/, /blog) continuem estáticas/ISR — o estado de
 * login hidrata no cliente, sem forçar render dinâmico no server.
 */
export default function NavLinks() {
  const naHome = usePathname() === "/";
  const ancora = (id: string) => (naHome ? `#${id}` : `/#${id}`);

  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function carregarNome(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", userId)
        .single();
      setNome((data?.nome as string) ?? null);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) carregarNome(user.id);
      setCarregado(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) carregarNome(session.user.id);
      else setNome(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setNome(null);
    router.refresh();
  }

  const logado = Boolean(nome);

  return (
    <>
      <nav>
        <ul className="nav-links">
          <li><a href={ancora("metodologia")}>Metodologia</a></li>
          <li><a href={ancora("modalidades")}>Modalidades</a></li>
          <li><a href={ancora("portfolio")}>Portfólio</a></li>
          <li><a href={ancora("diferenciais")}>Por que A.lab</a></li>
          <li><a href="/blog">Conteúdo</a></li>
          <li><a href={ancora("contato")}>Contato</a></li>
        </ul>
      </nav>

      <div className="nav-cta">
        {/* Só decide entre "Entrar" e o nome depois de carregar, p/ evitar piscar */}
        {carregado &&
          (logado ? (
            <div className="nav-user">
              <span className="nav-user-name">Olá, {nome!.split(" ")[0]}</span>
              <button type="button" onClick={sair} className="nav-link-btn">
                Sair
              </button>
            </div>
          ) : (
            <a href="/entrar" className="nav-link-btn">
              Entrar
            </a>
          ))}
        <a href={ancora("contato")} className="btn btn-primary">
          Falar com a A.lab
          <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </>
  );
}
