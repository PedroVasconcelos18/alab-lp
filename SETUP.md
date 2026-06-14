# SETUP — passos manuais (A.lab Blog/CMS)

Este arquivo lista **o que você (Pedro) precisa fazer à mão** — coisas que eu não
consigo automatizar (criar conta no Supabase, configurar OAuth do Google, setar
env vars na Vercel). Os passos estão agrupados por fase do `TECH-SPEC-BLOG.md`.

> **Agora (depois da Fase 0/1):** só o item **A** (rodar local) é necessário para
> ver a LP migrada funcionando. Os itens B–E entram quando começarmos a Fase 2
> (banco + auth). Pode fazê-los já se quiser adiantar.

---

## A) Rodar o projeto localmente (necessário agora)

```bash
cd alab-lp
npm install            # já rodei, mas rode de novo se faltar algo
cp .env.example .env.local   # já existe um .env.local com placeholders
npm run dev            # abre http://localhost:3000
```

A LP migrada já roda **sem** Supabase configurado — as variáveis no `.env.local`
podem ficar com os valores placeholder por enquanto. Supabase só é exigido a
partir da Fase 2.

Para confirmar que o visual está idêntico, compare `http://localhost:3000` com o
`index.html` original (abra o arquivo direto no navegador).

---

## B) Criar o projeto no Supabase (Fase 2)

1. Acesse https://supabase.com → **New project**.
2. Nome: `alab-blog` (ou o que preferir). Região: **South America (São Paulo)**.
3. Defina uma senha forte para o banco (guarde no seu gerenciador de senhas).
4. Aguarde o provisionamento (~2 min).
5. Vá em **Project Settings → API** e copie:
   - **Project URL** → vira `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → vira `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (em "Project API keys", revele) → vira
     `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta, nunca no client)
6. Cole esses valores no seu `.env.local` (substituindo os placeholders).

---

## C) Rodar as migrations SQL (Fase 2)

No painel do Supabase: **SQL Editor → New query**, cole o conteúdo de
`supabase/migrations/0001_init.sql` (vou criar esse arquivo na Fase 2 — ele
contém exatamente o SQL das tabelas, índices, RLS e o trigger do §4–§6 do spec) e
clique em **Run**.

> Por enquanto o arquivo ainda não existe; ele é entregue no início da Fase 2.

Depois de rodar, **promova você a admin** (faça login uma vez via Google primeiro
para criar seu `profile`, depois rode):

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'SEU-EMAIL@gmail.com');
```

---

## D) Configurar login com Google (Fase 2)

### D.1 — No Google Cloud Console
1. https://console.cloud.google.com → crie um projeto (ou use um existente).
2. **APIs & Services → OAuth consent screen**: tipo **External**, preencha nome do
   app ("A.lab"), email de suporte e email do dev. Pode deixar em "Testing".
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URIs**: cole a URL de callback do Supabase, que é:
     `https://SEU-PROJETO.supabase.co/auth/v1/callback`
     (pegue o domínio exato em Supabase → Authentication → Providers → Google)
4. Copie o **Client ID** e o **Client Secret**.

### D.2 — No Supabase
1. **Authentication → Providers → Google** → habilite.
2. Cole o **Client ID** e **Client Secret** do passo anterior. Salve.
3. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (dev) — depois troque para o domínio de
     produção.
   - **Redirect URLs**: adicione `http://localhost:3000/**` e o domínio de produção
     (`https://SEU-DOMINIO/**`).

---

## E) Configurar o login admin por email/senha (Fase 2)

1. Supabase → **Authentication → Providers → Email** → habilite (já vem ligado).
   - Para o MVP, pode **desligar** "Confirm email" (Authentication → Providers →
     Email → desmarcar confirmação) para o cadastro do admin ser direto. Reative
     depois se quiser.
2. Crie o usuário admin: **Authentication → Users → Add user** → email + senha.
3. Depois de rodar as migrations (C), promova esse usuário a admin com o SQL do
   item C.

---

## F) Variáveis de ambiente na Vercel (Fase 2 / pré go-live)

Em **Vercel → seu projeto → Settings → Environment Variables**, adicione (para
Production e Preview):

| Nome | Valor | Exposta ao client? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | sim |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **não** (secreta) |
| `NEXT_PUBLIC_SITE_URL` | `https://SEU-DOMINIO` | sim |

Depois faça um redeploy para as vars valerem.

---

## Checklist rápido

- [ ] A — `npm run dev` mostra a LP idêntica em localhost:3000  ← **agora**
- [ ] B — projeto Supabase criado, keys copiadas
- [ ] C — migrations rodadas, admin promovido
- [ ] D — Google OAuth configurado (Cloud Console + Supabase)
- [ ] E — usuário admin criado
- [ ] F — env vars na Vercel
