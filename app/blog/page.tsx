import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealEffects from "@/components/RevealEffects";
import ArticleCard from "@/components/ArticleCard";
import { listarPostsPublicados } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Conteúdo — A.lab",
  description:
    "Análises, frameworks e bastidores sobre venture building, M&A early stage e o ecossistema brasileiro de startups.",
};

// ISR: revalida a lista a cada 60s (o admin publica e em até 1 min aparece).
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await listarPostsPublicados();

  return (
    <>
      <Nav />
      <section className="content-section" style={{ paddingTop: 140 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow-dot">Sinais &amp; Conteúdo</span>
            <div>
              <h2 className="section-title silver-text">
                Empreender, validar,
                <br />
                <em>vender. Em alta resolução.</em>
              </h2>
              <p className="section-desc" style={{ marginTop: 24 }}>
                Análises, frameworks e bastidores sobre venture building, M&amp;A
                early stage e o que move o ecossistema brasileiro de startups.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <p style={{ color: "var(--silver-300)", marginTop: 24 }}>
              Em breve, novos conteúdos por aqui.
            </p>
          ) : (
            <div className="blog-grid">
              {posts.map((post, i) => (
                <ArticleCard key={post.id} post={post} featured={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <RevealEffects />
    </>
  );
}
