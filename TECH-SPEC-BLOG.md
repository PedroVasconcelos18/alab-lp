# Tech-Spec — Blog/CMS da A.lab

**Data:** 2026-06-14
**Autor:** Pedro Vasconcelos (+ Claude)
**Status:** Proposta para aprovação

---

## 1. Contexto e objetivo

O **Clama** já tem todo um fluxo de blog/CMS desenhado (posts, login de admin, login de
usuários para comentar/curtir, share no WhatsApp). Queremos reaproveitar **esse fluxo
conceitual** na A.lab, mas adaptado à realidade dela.

Os dois projetos são muito diferentes em maturidade técnica:

| | **Clama** | **A.lab (hoje)** |
|---|---|---|
| Stack | Django + DRF + Postgres + Redis + Celery (back) / React + Vite + Vike (front) | 1 arquivo `index.html` estático no Vercel |
| Backend | Servidor sempre ligado (Railway) | Nenhum |
| Blog | Especificado em docs, **ainda não implementado** | Seção "Conteúdo" já **desenhada** com placeholders `<a href="#">` |
| Auth | JWT custom (admin + customer) | Nenhuma |
| WhatsApp | `WhatsAppShareButton` (gera link `wa.me`) já pronto | Nenhum |

**Decisão central:** *não* portar a stack pesada do Clama (Django/Celery/Vike) para a
A.lab. Para uma landing page que hoje é estática, isso seria caro de operar e lento de
construir. Em vez disso, **replicamos o fluxo** com uma stack moderna e econômica:

> **Next.js (App Router) no Vercel + Supabase (Postgres + Auth + Storage).**

Mantemos o visual atual da A.lab (design dark/blueprint) e o conceito do Clama (admin
publica, usuário loga para interagir, todos compartilham no WhatsApp).

### O que reaproveitamos do Clama

- **Modelo de dados** do blog (Post, Comentário, Reação/Like) — traduzido de Django models para tabelas Postgres.
- **Fluxo de papéis**: admin vs. usuário comum (a separação `is_clama_admin` vira uma flag `is_admin`/role no Supabase).
- **Componente de share do WhatsApp** (`buildWhatsAppShareUrl`) — portado de React do Clama quase 1:1.
- **Padrões de UX** do CMS (editor, lista de posts, preview).

### O que deliberadamente *não* trazemos no MVP

Moderação avançada, banir usuário, SEO pesado (JSON-LD/IndexNow), retenção LGPD de IP
criptografado, rate limiting fino, polling de comentários. Tudo isso está no spec do
Clama e pode entrar depois (ver §10 — Fases futuras).

---

## 2. Decisões de arquitetura (aprovadas)

| Decisão | Escolha | Por quê |
|---|---|---|
| **Stack** | Next.js (App Router) + Supabase | Free tier generoso; admin/login/comentários/likes "de verdade" com custo ~zero; caminho mais próximo do fluxo do Clama sem servidor dedicado |
| **Hospedagem** | Vercel (já é onde a LP roda) | Zero migração de infra; deploy por `git push` |
| **Banco + Auth** | Supabase (Postgres + Auth + RLS) | Postgres gerenciado, auth pronta (incl. Google), segurança por Row Level Security |
| **Login usuário** | Google (one-click) | Menos atrito para comentar/curtir; sem senha para gerenciar |
| **Login admin** | Email + senha | Controle direto; poucos admins |
| **Escopo MVP** | Posts + comentários + curtidas + share WhatsApp | Exatamente o fluxo pedido, enxuto |
| **Renderização do blog** | SSG/ISR (`/blog`, `/blog/[slug]`) | Páginas públicas rápidas e cacheadas no CDN da Vercel |
| **Admin** | App client-side protegido (`/admin`) | Interatividade rica (editor); não precisa SEO |

---

## 3. Arquitetura de alto nível

```
┌────────────────────────────────────────────────────────────┐
│                     Vercel (Next.js)                         │
│                                                              │
│  /                LP atual (index.html migrada p/ React)     │
│  /blog            Lista de posts        ── SSG/ISR (CDN)     │
│  /blog/[slug]     Post + comentários + likes ── ISR + client │
│  /admin           CMS (protegido)       ── client-side       │
│  /admin/login     Login admin (email/senha)                  │
│                                                              │
│  /api (Route Handlers / Server Actions)                      │
│    - criar/editar/publicar post (admin)                      │
│    - criar comentário, toggle like (usuário logado)          │
└───────────────┬──────────────────────────────┬─────────────┘
                │                                │
                ▼                                ▼
        ┌───────────────┐               ┌──────────────────┐
        │   Supabase     │               │  Supabase Auth   │
        │   Postgres     │               │  - Google OAuth  │
        │  posts         │               │  - email/senha   │
        │  comments      │◀── RLS ──────│    (admin)        │
        │  likes         │               └──────────────────┘
        │  profiles      │
        └───────────────┘
```

**Por que SSG/ISR para o blog e client para o admin:** o blog precisa ser rápido e
indexável (visitantes); o admin precisa de interatividade (editor) mas não de SEO. Mesma
lógica do híbrido do Clama (Vike SSG + SPA admin), só que com as ferramentas nativas do
Next.

---

## 4. Modelo de dados (Postgres / Supabase)

Tradução direta dos models do Clama para SQL. Nomes em português para manter consistência
com o domínio do Clama (`Post`, `Comentario`, `Reacao`).

```sql
-- Perfis de usuário (espelha auth.users do Supabase, guarda role)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text,
  avatar_url  text,
  role        text not null default 'user'  -- 'user' | 'admin'
                check (role in ('user','admin')),
  created_at  timestamptz not null default now()
);

-- Posts do blog
create table posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  titulo        text not null,
  excerpt       text,                       -- resumo na listagem
  conteudo_md   text not null,              -- corpo em Markdown
  categoria     text,                       -- "Frameworks", "M&A", etc (já existem na LP)
  tempo_leitura int,                        -- minutos (ex: "12 min")
  capa_url      text,
  status        text not null default 'rascunho'
                  check (status in ('rascunho','publicado')),
  autor_id      uuid references profiles(id) on delete set null,
  publicado_em  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index posts_status_pub_idx on posts (status, publicado_em desc);

-- Comentários
create table comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references posts(id) on delete cascade,
  autor_id    uuid not null references profiles(id) on delete cascade,
  conteudo    text not null,
  created_at  timestamptz not null default now()
);
create index comments_post_idx on comments (post_id, created_at desc);

-- Curtidas (1 por usuário por post)
create table likes (
  post_id     uuid not null references posts(id) on delete cascade,
  autor_id    uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, autor_id)
);
```

**Notas de design (herdadas do Clama):**
- `status: rascunho | publicado` = o `status` do `Post` do Clama (versão enxuta, sem "despublicado").
- `likes` com PK composta `(post_id, autor_id)` = o `unique_together` do `Reacao` do Clama → garante 1 like por usuário por post.
- `conteudo_md` em Markdown (em vez do par `conteudo_html` + `conteudo_tiptap_json` do Clama). Markdown é mais simples e seguro de renderizar, e evita guardar HTML cru. Renderizado no server com sanitização.

---

## 5. Segurança (Row Level Security)

Em vez de middleware de permissão custom (como o `@require_unbanned_customer` do Clama),
usamos **RLS do Postgres** — a regra de acesso vive no banco e vale para qualquer caminho
de acesso.

```sql
alter table posts    enable row level security;
alter table comments enable row level security;
alter table likes    enable row level security;
alter table profiles enable row level security;

-- Posts: qualquer um lê os publicados; só admin escreve / vê rascunhos
create policy "posts_public_read" on posts
  for select using (status = 'publicado');
create policy "posts_admin_all" on posts
  for all using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Comentários: qualquer um lê; usuário logado cria o seu; autor edita/apaga o seu; admin apaga qualquer
create policy "comments_public_read" on comments for select using (true);
create policy "comments_insert_own"  on comments for insert
  with check (auth.uid() = autor_id);
create policy "comments_modify_own"  on comments for update using (auth.uid() = autor_id);
create policy "comments_delete_own_or_admin" on comments for delete using (
  auth.uid() = autor_id
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Likes: qualquer um conta; usuário logado curte/descurte o seu
create policy "likes_public_read" on likes for select using (true);
create policy "likes_toggle_own"  on likes for all
  using (auth.uid() = autor_id) with check (auth.uid() = autor_id);

-- Profiles: dono lê/edita o seu
create policy "profiles_own" on profiles for all using (auth.uid() = id);
```

**Promover admin:** o primeiro admin é setado manualmente no painel do Supabase
(`update profiles set role='admin' where id='...'`). Não há cadastro público de admin.

---

## 6. Autenticação

### Usuário comum (comentar/curtir)
- Botão **"Entrar com Google"** (Supabase Auth → Google OAuth provider).
- Ao logar pela 1ª vez, um trigger cria a linha em `profiles` com `role='user'`.
- Só aparece quando o usuário tenta comentar/curtir sem estar logado.

```sql
-- Trigger: cria profile ao registrar
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, nome, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
```

### Admin (gerir o blog)
- Página `/admin/login` com **email + senha** (Supabase Auth email provider).
- Acesso só liberado se `profiles.role = 'admin'` (checado no server + garantido por RLS).
- Equivalente ao `AdminLoginView` do Clama, mas sem JWT custom — a sessão é gerida pelo Supabase.

---

## 7. Páginas e rotas

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `/` | SSG | público | LP atual (migrada de `index.html`) |
| `/blog` | SSG/ISR | público | Lista de posts publicados (reusa o grid "Conteúdo" já desenhado) |
| `/blog/[slug]` | ISR | público | Post + comentários + likes + botão WhatsApp |
| `/admin/login` | client | público | Login admin (email/senha) |
| `/admin` | client | admin | Lista de posts (rascunho + publicado) |
| `/admin/posts/new` | client | admin | Criar post (editor Markdown + preview) |
| `/admin/posts/[id]` | client | admin | Editar/publicar/excluir post |

A seção `#conteudo` da LP (linhas 2039–2213 do `index.html` atual) já tem o markup do
grid de artigos. Ela vira o template do `/blog`, trocando os `<a href="#">` por links
reais (`/blog/[slug]`) alimentados pelo Supabase.

---

## 8. API (Server Actions / Route Handlers do Next.js)

Não precisamos de uma API REST separada — usamos Server Actions do Next, que conversam
com o Supabase. RLS garante a autorização.

| Ação | Quem | Operação |
|---|---|---|
| `criarPost`, `editarPost`, `publicarPost`, `excluirPost` | admin | CRUD em `posts` |
| `listarPostsPublicados` | público | `select` em `posts` (status=publicado) |
| `obterPost(slug)` | público | post + count de likes + comentários |
| `criarComentario(postId, texto)` | usuário logado | `insert` em `comments` |
| `excluirComentario(id)` | autor ou admin | `delete` em `comments` |
| `toggleLike(postId)` | usuário logado | `insert`/`delete` em `likes` |

Equivale aos ~10 endpoints planejados no Clama, condensados (sem moderação/ban no MVP).

---

## 9. Compartilhamento no WhatsApp

Portamos o componente do Clama
(`clama-frontend/src/components/clama/WhatsAppShareButton.tsx`) quase sem mudanças.

```tsx
// components/WhatsAppShareButton.tsx
export function buildWhatsAppShareUrl(titulo: string, url: string): string {
  const mensagem = `Li este conteúdo da A.lab e achei que faria sentido pra você:\n\n"${titulo}"\n\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}

export function WhatsAppShareButton({ titulo, url }: { titulo: string; url: string }) {
  return (
    <a
      href={buildWhatsAppShareUrl(titulo, url)}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-share"          /* estiliza com a cor #25D366 + design da A.lab */
      aria-label="Compartilhar no WhatsApp"
    >
      {/* ícone WhatsApp + "Compartilhar no WhatsApp" */}
    </a>
  );
}
```

- Aparece em cada `/blog/[slug]`.
- O link `wa.me?text=...` abre o WhatsApp (web/app) com a mensagem pré-preenchida → o usuário escolhe para quem mandar. Não precisa de API paga (diferente do envio via Z-API do Clama, que aqui *não* é necessário).
- Mantemos o `rel="noopener noreferrer"` por segurança, como no original.

---

## 10. Plano de implementação (fases)

### Fase 0 — Setup (~0,5 dia)
- Criar projeto Next.js (App Router, TypeScript) e linkar ao repo `alab-lp`.
- Criar projeto no Supabase; configurar Google OAuth + email provider.
- Variáveis de ambiente na Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `..._ANON_KEY`, service role só no server).

### Fase 1 — Migração da LP (~1 dia)
- Portar `index.html` para um componente Next (manter o `<style>` atual ou converter para CSS module). Visual idêntico.
- Garantir que o site continua publicando igual no Vercel.

### Fase 2 — Banco + Auth (~1 dia)
- Rodar as migrations (§4) e policies RLS (§5).
- Implementar login Google (usuário) e login admin email/senha.
- Trigger de criação de `profiles`; promover o 1º admin manualmente.

### Fase 3 — Blog público (~1,5 dia)
- `/blog` reusando o grid "Conteúdo" da LP, alimentado pelo Supabase (SSG/ISR).
- `/blog/[slug]`: render do Markdown (sanitizado), contador de likes, lista de comentários.
- Botão WhatsApp (§9).

### Fase 4 — Interações do usuário (~1 dia)
- Comentar (logado), excluir próprio comentário.
- Curtir/descurtir (toggle) com UI otimista.

### Fase 5 — Admin/CMS (~1,5 dia)
- `/admin`: lista de posts (rascunho/publicado).
- Editor (Markdown + preview lado a lado), criar/editar/publicar/excluir.

### Fase 6 — Polimento e go-live (~0,5 dia)
- Revisar RLS (tentar acessar rascunho deslogado, comentar deslogado, etc.).
- Meta tags básicas (Open Graph) para o share ficar bonito.
- Deploy de produção.

**Total estimado: ~7 dias de trabalho** para o MVP completo.

---

## 11. Custos

| Item | Plano | Custo |
|---|---|---|
| Vercel | Hobby/Free (já em uso) | R$ 0 |
| Supabase | Free tier (até 500MB DB, 50k MAU auth) | R$ 0 |
| Google OAuth | Gratuito | R$ 0 |
| WhatsApp share | Link `wa.me` (sem API) | R$ 0 |
| Domínio | já existente | — |

**MVP roda em R$ 0/mês** nos free tiers. Só haveria custo se o tráfego/uso crescer muito
(upgrade Supabase Pro ~US$ 25/mês), o que é um bom problema para se ter.

> Contraste com "reusar o backend do Clama": o Django exigiria servidor sempre ligado +
> Postgres + Redis + worker (Railway), com custo mensal recorrente e acoplamento entre os
> dois produtos. A opção escolhida é mais barata e independente.

---

## 12. Fases futuras (do spec do Clama, fora do MVP)

Quando fizer sentido, dá para puxar do spec do Clama:
- **Moderação** de comentários + banir usuário (tabela `banidos` + policies).
- **SEO avançado**: `sitemap.xml`, JSON-LD Article, IndexNow.
- **LGPD**: armazenar/criptografar IP do comentário + purga automática.
- **Rate limiting** em comentários/likes.
- **Editor rico** (Tiptap, como o Clama) no lugar do Markdown, se a edição ficar frequente.
- **Notificações** (ex: avisar admin de novo comentário).

---

## 13. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Migrar o `index.html` (2360 linhas) para Next quebrar o visual | Fase 1 isolada; manter `<style>` atual no início, refatorar depois |
| Spam de comentários (sem moderação no MVP) | Login obrigatório (Google) já reduz muito; moderação na fase futura |
| Vazamento de rascunho | RLS bloqueia no banco (`status='publicado'` para público); testado na Fase 6 |
| Lock-in no Supabase | É Postgres puro + auth padrão; migração para outro Postgres é viável |

---

## 14. Resumo

Replicamos o fluxo de blog do Clama (admin publica, usuário loga p/ comentar e curtir,
todos compartilham no WhatsApp) na A.lab usando **Next.js + Supabase no Vercel** — em vez
de portar a stack Django pesada. Reusamos o **modelo de dados**, o **conceito de papéis**
e o **componente de WhatsApp** do Clama, adaptados a uma arquitetura serverless de **custo
zero** no MVP. O visual atual da A.lab é preservado e a seção "Conteúdo" já desenhada vira
o `/blog` real.
