"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { entrar, type AuthState } from "@/app/auth/actions";
import Nav from "@/components/Nav";

function EntrarForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [state, action, pending] = useActionState<AuthState, FormData>(
    entrar,
    null,
  );

  return (
    <form action={action} className="auth-form">
      <input type="hidden" name="next" value={next} />
      <label className="auth-label">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="auth-input"
          placeholder="voce@email.com"
        />
      </label>
      <label className="auth-label">
        Senha
        <input
          type="password"
          name="senha"
          required
          autoComplete="current-password"
          className="auth-input"
          placeholder="••••••••"
        />
      </label>

      {state?.erro && <p className="auth-erro">{state.erro}</p>}

      <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <p className="auth-switch" style={{ marginTop: 14 }}>
        <Link href="/recuperar-senha">Esqueceu a senha?</Link>
      </p>
      <p className="auth-switch" style={{ marginTop: 8 }}>
        Não tem conta? <Link href="/cadastro">Criar conta</Link>
      </p>
    </form>
  );
}

export default function EntrarPage() {
  return (
    <>
      <Nav />
      <main className="auth-wrap">
        <div className="auth-card">
          <span className="eyebrow eyebrow-dot">Acesso</span>
          <h1 className="silver-text auth-title">Entrar</h1>
          <p className="auth-desc">
            Entre para comentar e curtir os conteúdos da A.lab.
          </p>
          <Suspense fallback={null}>
            <EntrarForm />
          </Suspense>
        </div>
      </main>
    </>
  );
}
