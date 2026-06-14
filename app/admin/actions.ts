"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PostStatus } from "@/lib/types";

export type AdminState = { erro?: string } | null;

/**
 * Login do admin (email + senha). Só libera se o profile tiver role='admin'.
 * Se logar mas não for admin, desfaz a sessão e recusa.
 */
export async function entrarAdmin(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { data: signin, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error || !signin.user) return { erro: "E-mail ou senha incorretos." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signin.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { erro: "Esta conta não tem acesso de administrador." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function sairAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------
// CRUD de posts — a autorização final é o RLS (posts_admin_all). Estas
// actions assumem admin (as páginas chamam requireAdmin antes de renderizar).
// ---------------------------------------------------------------------

interface PostInput {
  titulo: string;
  slug: string;
  excerpt: string;
  conteudo_md: string;
  categoria: string;
  tempo_leitura: string;
  capa_url: string;
  status: PostStatus;
}

function lerForm(formData: FormData): PostInput {
  return {
    titulo: String(formData.get("titulo") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    conteudo_md: String(formData.get("conteudo_md") ?? ""),
    categoria: String(formData.get("categoria") ?? "").trim(),
    tempo_leitura: String(formData.get("tempo_leitura") ?? "").trim(),
    capa_url: String(formData.get("capa_url") ?? "").trim(),
    status: (String(formData.get("status") ?? "rascunho") as PostStatus),
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function montarRegistro(input: PostInput) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.titulo);
  return {
    titulo: input.titulo,
    slug,
    excerpt: input.excerpt || null,
    conteudo_md: input.conteudo_md,
    categoria: input.categoria || null,
    tempo_leitura: input.tempo_leitura ? Number(input.tempo_leitura) : null,
    capa_url: input.capa_url || null,
    status: input.status,
  };
}

/** Cria um post. Retorna {erro} ou redireciona para a edição. */
export async function criarPost(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const input = lerForm(formData);
  if (!input.titulo) return { erro: "O título é obrigatório." };
  if (!input.conteudo_md.trim()) return { erro: "O conteúdo não pode ficar vazio." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const registro = montarRegistro(input);
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...registro,
      autor_id: user?.id ?? null,
      publicado_em:
        registro.status === "publicado" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { erro: "Já existe um post com esse slug." };
    return { erro: "Não foi possível criar o post." };
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect(`/admin/posts/${data.id}`);
}

/** Edita um post existente. */
export async function editarPost(
  id: string,
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const input = lerForm(formData);
  if (!input.titulo) return { erro: "O título é obrigatório." };
  if (!input.conteudo_md.trim()) return { erro: "O conteúdo não pode ficar vazio." };

  const supabase = await createClient();
  const registro = montarRegistro(input);

  // Garante publicado_em coerente: define ao publicar, mantém senão.
  const { data: atual } = await supabase
    .from("posts")
    .select("publicado_em, status")
    .eq("id", id)
    .single();

  let publicado_em = atual?.publicado_em ?? null;
  if (registro.status === "publicado" && !publicado_em) {
    publicado_em = new Date().toISOString();
  }

  const { error } = await supabase
    .from("posts")
    .update({ ...registro, publicado_em })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { erro: "Já existe um post com esse slug." };
    return { erro: "Não foi possível salvar." };
  }

  revalidatePath("/admin");
  revalidatePath("/blog");
  revalidatePath(`/blog/${registro.slug}`);
  return null;
}

/** Alterna rascunho <-> publicado direto da lista. */
export async function alternarStatus(id: string, novo: PostStatus) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status: novo };
  if (novo === "publicado") {
    const { data: atual } = await supabase
      .from("posts")
      .select("publicado_em")
      .eq("id", id)
      .single();
    if (!atual?.publicado_em) patch.publicado_em = new Date().toISOString();
  }
  await supabase.from("posts").update(patch).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/blog");
}

/** Exclui um post. */
export async function excluirPost(id: string) {
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect("/admin");
}
