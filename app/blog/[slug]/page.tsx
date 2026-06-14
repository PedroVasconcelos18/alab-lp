import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";
import { obterPostPorSlug, listarSlugsPublicados } from "@/lib/posts";
import { getProfile } from "@/lib/auth";
import { formatarData } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await listarSlugsPublicados();
  return slugs.map((slug) => ({ slug }));
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await obterPostPorSlug(slug);
  if (!data) return { title: "Conteúdo não encontrado — A.lab" };

  const { post } = data;
  const url = `${siteUrl()}/blog/${post.slug}`;
  return {
    title: `${post.titulo} — A.lab`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.titulo,
      description: post.excerpt ?? undefined,
      url,
      type: "article",
      // A imagem OG vem de opengraph-image.tsx (gerada com o título do post).
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [data, profile] = await Promise.all([
    obterPostPorSlug(slug),
    getProfile(),
  ]);
  if (!data) notFound();

  const { post, likes, comentarios, jaCurtiu } = data;
  const url = `${siteUrl()}/blog/${post.slug}`;

  return (
    <>
      <Nav />
      <article className="post">
        <div className="container post-container">
          <Link href="/blog" className="post-back">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M13 8H3M7 4L3 8l4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Conteúdo
          </Link>

          <div className="article-meta" style={{ marginTop: 28 }}>
            {post.categoria && (
              <span className="article-cat">{post.categoria}</span>
            )}
            {post.tempo_leitura ? (
              <>
                <span>·</span>
                <span>{post.tempo_leitura} min</span>
              </>
            ) : null}
            {post.publicado_em && (
              <>
                <span>·</span>
                <span>{formatarData(post.publicado_em)}</span>
              </>
            )}
          </div>

          <h1 className="post-title silver-text">{post.titulo}</h1>
          {post.excerpt && <p className="post-lead">{post.excerpt}</p>}

          <div className="post-toolbar">
            <div className="post-stats">
              <LikeButton
                postId={post.id}
                slug={post.slug}
                likesIniciais={likes}
                jaCurtiu={jaCurtiu}
                logado={Boolean(profile)}
              />
              <span title="Comentários">💬 {comentarios.length}</span>
            </div>
            <WhatsAppShareButton titulo={post.titulo} url={url} />
          </div>

          <div className="post-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {post.conteudo_md}
            </ReactMarkdown>
          </div>

          <CommentsSection
            postId={post.id}
            slug={post.slug}
            comentariosIniciais={comentarios}
            userId={profile?.id ?? null}
            isAdmin={profile?.role === "admin"}
          />
        </div>
      </article>
      <Footer />
    </>
  );
}
