"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarReset, type AuthState } from "@/app/auth/actions";
import Nav from "@/components/Nav";

export default function RecuperarSenhaPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    solicitarReset,
    null,
  );

  return (
    <>
      <Nav />
      <main className="auth-wrap">
        <div className="auth-card">
          <span className="eyebrow eyebrow-dot">Acesso</span>
          <h1 className="silver-text auth-title">Esqueci a senha</h1>
          <p className="auth-desc">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </p>

          {state?.ok ? (
            <p className="auth-ok">{state.ok}</p>
          ) : (
            <form action={action} className="auth-form">
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

              {state?.erro && <p className="auth-erro">{state.erro}</p>}

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={pending}
              >
                {pending ? "Enviando…" : "Enviar link de recuperação"}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Lembrou? <Link href="/entrar">Entrar</Link>
          </p>
        </div>
      </main>
    </>
  );
}
