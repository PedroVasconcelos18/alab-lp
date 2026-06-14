import { listarPostsPublicados } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";

export default async function Conteudo() {
  const todos = await listarPostsPublicados();
  const posts = todos.slice(0, 5); // home mostra os mais recentes; /blog tem todos

  return (
    <section className="content-section" id="conteudo">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow-dot">Sinais & Conteúdo</span>
          <div>
            <h2 className="section-title silver-text">Empreender, validar,<br /><em>vender. Em alta resolução.</em></h2>
            <p className="section-desc" style={{ marginTop: "24px" }}>Análises, frameworks e bastidores sobre venture building, M&A early stage e o que move o ecossistema brasileiro de startups.</p>
          </div>
        </div>

        {posts.length === 0 ? (
          <p style={{ color: "var(--silver-300)" }}>
            Em breve, novos conteúdos por aqui.
          </p>
        ) : (
          <div className="blog-grid">
            {posts.map((post, i) => (
              <ArticleCard key={post.id} post={post} featured={i === 0} />
            ))}
          </div>
        )}

        {todos.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <a href="/blog" className="btn btn-ghost">
              Ver todos os conteúdos
              <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
