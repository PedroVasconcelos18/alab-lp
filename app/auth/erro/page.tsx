import Link from "next/link";

/** Página de fallback quando o login falha. Visual no estilo da LP. */
export default function AuthErro() {
  return (
    <main className="container" style={{ padding: "120px 32px", textAlign: "center" }}>
      <span className="eyebrow eyebrow-dot">Autenticação</span>
      <h1 className="silver-text" style={{ marginTop: 24 }}>
        Não foi possível entrar
      </h1>
      <p style={{ marginTop: 16 }}>
        O link de login expirou ou já foi usado. Tente novamente.
      </p>
      <div style={{ marginTop: 32 }}>
        <Link href="/" className="btn btn-ghost">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
