"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export type AuthState = { erro?: string; ok?: string } | null;

/**
 * Cadastro público (email + senha, role=user via trigger handle_new_user).
 * Exige confirmação de e-mail: o Supabase manda o link, que volta em
 * /auth/callback. Não loga na hora — mostra mensagem pedindo confirmação.
 */
export async function cadastrar(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!nome || !email || !senha) {
    return { erro: "Preencha nome, e-mail e senha." };
  }
  if (senha.length < 8) {
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { name: nome },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) return { erro: traduzErro(error.message) };

  return {
    ok: "Conta criada! Enviamos um e-mail de confirmação — clique no link para ativar e depois entre.",
  };
}

/** Login email + senha. Redireciona para `next` (ou /) em caso de sucesso. */
export async function entrar(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) return { erro: traduzErro(error.message) };

  revalidatePath("/", "layout");
  redirect(next);
}

/**
 * Solicita o e-mail de recuperação de senha. O Supabase envia um link que
 * volta em /auth/callback e leva o usuário para /redefinir-senha (já com sessão
 * temporária válida para trocar a senha).
 */
export async function solicitarReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { erro: "Informe seu e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/redefinir-senha`,
  });

  // Mesmo se o e-mail não existir, respondemos OK (não revela quais e-mails
  // têm conta — boa prática de segurança).
  if (error && !error.message.toLowerCase().includes("rate"))
    return { erro: "Não foi possível enviar agora. Tente novamente em instantes." };

  return {
    ok: "Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.",
  };
}

/**
 * Define a nova senha. Só funciona se o usuário tiver uma sessão válida — o
 * que acontece logo após clicar no link de recuperação (callback troca o code
 * por sessão). Sem sessão, o updateUser falha e pedimos para refazer o fluxo.
 */
export async function redefinirSenha(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const senha = String(formData.get("senha") ?? "");
  const confirma = String(formData.get("confirma") ?? "");

  if (senha.length < 8)
    return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  if (senha !== confirma) return { erro: "As senhas não coincidem." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      erro: "Link expirado ou inválido. Solicite um novo e-mail de recuperação.",
    };

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { erro: "Não foi possível redefinir a senha." };

  return { ok: "Senha redefinida! Você já pode entrar com a nova senha." };
}

/** Logout. */
export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Mensagens de erro do Supabase em português, para os casos comuns. */
function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar (veja o link que enviamos).";
  if (m.includes("user already registered") || m.includes("already registered"))
    return "Já existe uma conta com esse e-mail. Tente entrar.";
  if (m.includes("password"))
    return "Senha inválida (mínimo 8 caracteres).";
  return "Não foi possível concluir. Tente novamente.";
}
