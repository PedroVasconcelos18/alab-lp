/**
 * Tipos de domínio do blog — nomes em português, espelhando as tabelas do
 * Postgres (ver §4 do TECH-SPEC-BLOG.md). Mantidos manualmente por enquanto;
 * podem ser gerados via `supabase gen types` quando o CLI estiver configurado.
 */

export type Role = "user" | "admin";
export type PostStatus = "rascunho" | "publicado";

export interface Profile {
  id: string;
  nome: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  titulo: string;
  excerpt: string | null;
  conteudo_md: string;
  categoria: string | null;
  tempo_leitura: number | null;
  capa_url: string | null;
  status: PostStatus;
  autor_id: string | null;
  publicado_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comentario {
  id: string;
  post_id: string;
  autor_id: string;
  conteudo: string;
  created_at: string;
  // Join opcional com o perfil do autor (para exibir nome/avatar).
  autor?: Pick<Profile, "nome" | "avatar_url"> | null;
}

export interface Like {
  post_id: string;
  autor_id: string;
  created_at: string;
}
