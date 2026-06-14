import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import type { Post, Comentario } from "@/lib/types";

/**
 * Lista posts publicados (mais recentes primeiro). Usado no /blog e na seção
 * "Conteúdo" da home. Usa o cliente estático (sem cookies) porque só lê dados
 * públicos e roda em contexto de ISR/build, onde não há request/cookies.
 */
export async function listarPostsPublicados(): Promise<Post[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "publicado")
    .order("publicado_em", { ascending: false });

  if (error) throw error;
  return (data as Post[]) ?? [];
}

/**
 * Slugs de todos os posts publicados — para generateStaticParams.
 * Usa o cliente estático (sem cookies), pois roda em build time.
 */
export async function listarSlugsPublicados(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "publicado");
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

/**
 * Lista TODOS os posts (rascunho + publicado) para o admin. O RLS
 * (posts_admin_all) só retorna tudo se o usuário logado for admin; para
 * qualquer outro, devolve apenas os publicados.
 */
export async function listarTodosPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as Post[]) ?? [];
}

/** Obtém um post por id (qualquer status) — para o editor do admin. */
export async function obterPostPorId(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Post) ?? null;
}

export interface PostComContagem {
  post: Post;
  likes: number;
  comentarios: Comentario[];
  jaCurtiu: boolean;
}

/**
 * Obtém um post publicado por slug, com a lista de comentários (incluindo
 * nome/avatar do autor) e a contagem de likes. Retorna null se não existir
 * ou não estiver publicado (o RLS já garante que rascunho não vaza).
 */
export async function obterPostPorSlug(
  slug: string,
): Promise<PostComContagem | null> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .single();

  if (!post) return null;
  const p = post as Post;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: likes }, { data: comentarios }, curtida] = await Promise.all([
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", p.id),
    supabase
      .from("comments")
      .select("*, autor:profiles(nome, avatar_url)")
      .eq("post_id", p.id)
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("likes")
          .select("post_id")
          .eq("post_id", p.id)
          .eq("autor_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    post: p,
    likes: likes ?? 0,
    comentarios: (comentarios as Comentario[]) ?? [],
    jaCurtiu: Boolean(curtida.data),
  };
}
