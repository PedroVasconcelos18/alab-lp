"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cadastrar, type AuthState } from "@/app/auth/actions";
import Nav from "@/components/Nav";

export default function CadastroPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    cadastrar,
    null,
  );

  return (
    <>
      <Nav />
      <main className="auth-wrap">
        <div className="auth-card">
          <span className="eyebrow eyebrow-dot">Acesso</span>
          <h1 className="silver-text auth-title">Criar conta</h1>
          <p className="auth-desc">
            Crie sua conta para comentar e curtir. Leva 30 segundos.
          </p>

          {state?.ok ? (
            <p className="auth-ok">{state.ok}</p>
          ) : (
            <form action={action} className="auth-form">
              <label className="auth-label">
                Nome
                <input
                  type="text"
                  name="nome"
                  required
                  autoComplete="name"
                  className="auth-input"
                  placeholder="Seu nome"
                />
              </label>
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
                  minLength={8}
                  autoComplete="new-password"
                  className="auth-input"
                  placeholder="Mínimo 8 caracteres"
                />
              </label>

              {state?.erro && <p className="auth-erro">{state.erro}</p>}

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={pending}
              >
                {pending ? "Criando…" : "Criar conta"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Já tem conta? <Link href="/entrar">Entrar</Link>
          </p>
        </div>
      </main>
    </>
  );
}
