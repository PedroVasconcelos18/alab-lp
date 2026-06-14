-- =====================================================================
-- A.lab Blog/CMS — Migration inicial
-- Fonte: TECH-SPEC-BLOG.md §4 (modelo de dados), §5 (RLS), §6 (auth trigger)
-- Rode isto no Supabase: SQL Editor > New query > cole tudo > Run.
-- Idempotente o suficiente para rodar uma vez num projeto novo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- §4 — TABELAS
-- ---------------------------------------------------------------------

-- Perfis de usuário (espelha auth.users do Supabase, guarda role)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text,
  avatar_url  text,
  role        text not null default 'user'        -- 'user' | 'admin'
                check (role in ('user','admin')),
  created_at  timestamptz not null default now()
);

-- Posts do blog
create table if not exists posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  titulo        text not null,
  excerpt       text,                              -- resumo na listagem
  conteudo_md   text not null,                     -- corpo em Markdown
  categoria     text,                              -- "Frameworks", "M&A", etc
  tempo_leitura int,                               -- minutos (ex: 12)
  capa_url      text,
  status        text not null default 'rascunho'
                  check (status in ('rascunho','publicado')),
  autor_id      uuid references profiles(id) on delete set null,
  publicado_em  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_status_pub_idx on posts (status, publicado_em desc);

-- Comentários
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references posts(id) on delete cascade,
  autor_id    uuid not null references profiles(id) on delete cascade,
  conteudo    text not null,
  created_at  timestamptz not null default now()
);
create index if not exists comments_post_idx on comments (post_id, created_at desc);

-- Curtidas (1 por usuário por post)
create table if not exists likes (
  post_id     uuid not null references posts(id) on delete cascade,
  autor_id    uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, autor_id)
);

-- updated_at automático em posts (não estava no spec, mas mantém o campo correto)
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
  before update on posts for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- §5 — ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table posts    enable row level security;
alter table comments enable row level security;
alter table likes    enable row level security;
alter table profiles enable row level security;

-- Posts: qualquer um lê os publicados; só admin escreve / vê rascunhos
drop policy if exists "posts_public_read" on posts;
create policy "posts_public_read" on posts
  for select using (status = 'publicado');

drop policy if exists "posts_admin_all" on posts;
create policy "posts_admin_all" on posts
  for all using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Comentários: qualquer um lê; logado cria o seu; autor edita/apaga o seu; admin apaga qualquer
drop policy if exists "comments_public_read" on comments;
create policy "comments_public_read" on comments for select using (true);

drop policy if exists "comments_insert_own" on comments;
create policy "comments_insert_own"  on comments for insert
  with check (auth.uid() = autor_id);

drop policy if exists "comments_modify_own" on comments;
create policy "comments_modify_own"  on comments for update using (auth.uid() = autor_id);

drop policy if exists "comments_delete_own_or_admin" on comments;
create policy "comments_delete_own_or_admin" on comments for delete using (
  auth.uid() = autor_id
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Likes: qualquer um conta; usuário logado curte/descurte o seu
drop policy if exists "likes_public_read" on likes;
create policy "likes_public_read" on likes for select using (true);

drop policy if exists "likes_toggle_own" on likes;
create policy "likes_toggle_own"  on likes for all
  using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

-- Profiles:
--  - leitura PÚBLICA (necessária para exibir nome/avatar do autor dos
--    comentários para qualquer visitante; o RLS de uma tabela ainda se aplica
--    quando ela aparece num join, então sem isto os nomes não apareceriam).
--    Não expõe nada sensível: nome e avatar já são públicos por natureza.
--  - escrita só do próprio dono.
drop policy if exists "profiles_public_read" on profiles;
create policy "profiles_public_read" on profiles for select using (true);

drop policy if exists "profiles_own_write" on profiles;
create policy "profiles_own_write" on profiles for update using (auth.uid() = id);

drop policy if exists "profiles_own_insert" on profiles;
create policy "profiles_own_insert" on profiles for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- §6 — TRIGGER: cria profile ao registrar usuário
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public          -- necessário p/ resolver `profiles` no contexto do auth
as $$
begin
  insert into public.profiles (id, nome, avatar_url)
  values (
    new.id,
    -- 'name'/'full_name' quando vier de metadata; senão cai no email.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
