import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatarData } from "@/lib/format";

/**
 * Card de artigo reutilizado no /blog e na seção "Conteúdo" da home.
 * Mantém exatamente o markup/classes do grid desenhado na LP original.
 */
export default function ArticleCard({
  post,
  featured = false,
}: {
  post: Post;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`article reveal${featured ? " featured" : ""}`}
    >
      <div className="article-cover cover-blueprint">
        <div className="cover-art" aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#5BB4FF"
              strokeWidth="1"
              fill="none"
              strokeDasharray="2 4"
              opacity="0.5"
            />
            <circle
              cx="100"
              cy="100"
              r="50"
              stroke="#5BB4FF"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            <circle cx="100" cy="100" r="6" fill="#5BB4FF" />
          </svg>
        </div>
        <div className="cover-overlay"></div>
      </div>
      <div className="article-body">
        <div className="article-meta">
          {post.categoria && <span className="article-cat">{post.categoria}</span>}
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
        <h3>{post.titulo}</h3>
        {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
        <span className="article-link">
          Ler análise
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
