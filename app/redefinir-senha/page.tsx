"use client";

import { useActionState } from "react";
import Link from "next/link";
import { redefinirSenha, type AuthState } from "@/app/auth/actions";
import Nav from "@/components/Nav";

export default function RedefinirSenhaPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    redefinirSenha,
    null,
  );

  return (
    <>
      <Nav />
      <main className="auth-wrap">
        <div className="auth-card">
          <span className="eyebrow eyebrow-dot">Acesso</span>
          <h1 className="silver-text auth-title">Nova senha</h1>
          <p className="auth-desc">Defina sua nova senha de acesso.</p>

          {state?.ok ? (
            <>
              <p className="auth-ok">{state.ok}</p>
              <p className="auth-switch">
                <Link href="/entrar">Ir para o login</Link>
              </p>
            </>
          ) : (
            <form action={action} className="auth-form">
              <label className="auth-label">
                Nova senha
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
              <label className="auth-label">
                Confirmar senha
                <input
                  type="password"
                  name="confirma"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="auth-input"
                  placeholder="Repita a senha"
                />
              </label>

              {state?.erro && <p className="auth-erro">{state.erro}</p>}

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={pending}
              >
                {pending ? "Salvando…" : "Redefinir senha"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
