import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listarTodosPosts } from "@/lib/posts";
import { sairAdmin } from "@/app/admin/actions";
import { formatarDataCompleta } from "@/lib/format";
import PostRowActions from "@/components/admin/PostRowActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const posts = await listarTodosPosts();

  const rascunhos = posts.filter((p) => p.status === "rascunho").length;
  const publicados = posts.length - rascunhos;

  return (
    <main className="admin">
      <div className="admin-shell">
        <header className="admin-head">
          <div>
            <span className="eyebrow eyebrow-dot">Painel · A.lab</span>
            <h1 className="silver-text admin-h1">Conteúdo</h1>
            <p className="admin-sub">
              {publicados} publicado{publicados !== 1 ? "s" : ""} ·{" "}
              {rascunhos} rascunho{rascunhos !== 1 ? "s" : ""} ·{" "}
              {admin.nome ?? "admin"}
            </p>
          </div>
          <div className="admin-head-actions">
            <Link href="/admin/posts/new" className="btn btn-primary">
              Novo post
            </Link>
            <form action={sairAdmin}>
              <button type="submit" className="btn btn-ghost">
                Sair
              </button>
            </form>
          </div>
        </header>

        {posts.length === 0 ? (
          <div className="admin-empty">
            <p>Nenhum post ainda.</p>
            <Link href="/admin/posts/new" className="btn btn-primary">
              Criar o primeiro
            </Link>
          </div>
        ) : (
          <ul className="admin-list">
            {posts.map((p) => (
              <li key={p.id} className="admin-row">
                <div className="admin-row-main">
                  <span
                    className={`admin-badge ${
                      p.status === "publicado" ? "is-pub" : "is-draft"
                    }`}
                  >
                    {p.status === "publicado" ? "Publicado" : "Rascunho"}
                  </span>
                  <Link href={`/admin/posts/${p.id}`} className="admin-row-title">
                    {p.titulo}
                  </Link>
                  <span className="admin-row-meta">
                    {p.categoria ? `${p.categoria} · ` : ""}
                    atualizado {formatarDataCompleta(p.updated_at)}
                  </span>
                </div>
                <PostRowActions
                  id={p.id}
                  slug={p.slug}
                  status={p.status}
                  titulo={p.titulo}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
