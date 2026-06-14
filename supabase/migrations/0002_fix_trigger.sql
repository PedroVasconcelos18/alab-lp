-- =====================================================================
-- FIX: "Database error saving new user" no cadastro.
-- Causa: a função security-definer handle_new_user roda sem search_path
-- fixo; no contexto do GoTrue (auth) ela não resolve a tabela `profiles`
-- nem `public.profiles`, e a inserção falha, abortando a criação do usuário.
-- Solução: fixar search_path = public e qualificar a tabela.
-- Rode no Supabase: SQL Editor > New query > cole > Run.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public          -- <- o que faltava
as $$
begin
  insert into public.profiles (id, nome, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      new.email
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$;

-- Recria o trigger garantindo que aponta para a função corrigida.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row
  execute function public.handle_new_user();
