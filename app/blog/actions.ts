"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AcaoResultado = { erro?: string; ok?: boolean };

/**
 * Curte ou descurte um post (toggle). Exige login.
 * O RLS garante que o usuário só mexe no próprio like (auth.uid() = autor_id).
 */
export async function toggleLike(
  postId: string,
  slug: string,
): Promise<AcaoResultado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Entre para curtir." };

  // Já curtiu? Então descurte.
  const { data: existente } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("autor_id", user.id)
    .maybeSingle();

  if (existente) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("autor_id", user.id);
    if (error) return { erro: "Não foi possível descurtir." };
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: postId, autor_id: user.id });
    if (error) return { erro: "Não foi possível curtir." };
  }

  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

/** Cria um comentário. Exige login. */
export async function criarComentario(
  postId: string,
  slug: string,
  texto: string,
): Promise<AcaoResultado> {
  const conteudo = texto.trim();
  if (!conteudo) return { erro: "Escreva algo antes de enviar." };
  if (conteudo.length > 2000) return { erro: "Comentário muito longo." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Entre para comentar." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, autor_id: user.id, conteudo });

  if (error) return { erro: "Não foi possível enviar o comentário." };

  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

/**
 * Edita um comentário. O RLS (comments_modify_own) só permite o autor alterar
 * o próprio comentário — se não for dele, o update não afeta nenhuma linha.
 */
export async function editarComentario(
  comentarioId: string,
  slug: string,
  texto: string,
): Promise<AcaoResultado> {
  const conteudo = texto.trim();
  if (!conteudo) return { erro: "O comentário não pode ficar vazio." };
  if (conteudo.length > 2000) return { erro: "Comentário muito longo." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { error } = await supabase
    .from("comments")
    .update({ conteudo })
    .eq("id", comentarioId);

  if (error) return { erro: "Não foi possível salvar a edição." };

  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

/**
 * Exclui um comentário. O RLS permite só o autor (ou admin); aqui passamos
 * o id e deixamos a policy decidir — se não for dele, nada é apagado.
 */
export async function excluirComentario(
  comentarioId: string,
  slug: string,
): Promise<AcaoResultado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Sessão expirada." };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", comentarioId);

  if (error) return { erro: "Não foi possível excluir." };

  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}
