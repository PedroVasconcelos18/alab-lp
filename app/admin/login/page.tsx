"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { entrarAdmin, type AdminState } from "@/app/admin/actions";

function LoginForm() {
  const params = useSearchParams();
  const semAcesso = params.get("erro") === "sem-acesso";
  const [state, action, pending] = useActionState<AdminState, FormData>(
    entrarAdmin,
    null,
  );

  return (
    <form action={action} className="auth-form">
      <label className="auth-label">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="auth-input"
          placeholder="admin@alab.com"
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

      {(state?.erro || semAcesso) && (
        <p className="auth-erro">
          {state?.erro ?? "Você precisa de uma conta de administrador."}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary auth-submit"
        disabled={pending}
      >
        {pending ? "Entrando…" : "Entrar no painel"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow eyebrow-dot">Painel · A.lab</span>
        <h1 className="silver-text auth-title">Admin</h1>
        <p className="auth-desc">Acesso restrito à gestão de conteúdo.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
