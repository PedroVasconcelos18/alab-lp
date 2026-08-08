# Playbook: colocar um produto em WordPress sob `clama.me`

Como o blog foi para o ar, escrito para ser repetido. Tudo aqui foi executado e verificado em produção — não é plano, é registro.

O caso concreto: `clama.me/blog` servido por WordPress no Railway, com o app React seguindo dono do resto do domínio.

---

## 1 · A decisão de topologia

**Subdiretório, não subdomínio.** `clama.me/blog`, não `blog.clama.me`.

O ganho é de SEO: subdiretório herda a autoridade do domínio. O custo é que as duas aplicações passam a dividir origem — e é daí que vem quase toda a complexidade das seções seguintes.

O mecanismo é **Strangler Fig**: um rewrite na borda decide quem atende cada caminho. Trocar o dono de `/blog` é mudar uma linha; reverter também.

```
clama.me/*        → app React (Vercel)
clama.me/blog/*   → WordPress (Railway)
clama.me/api/*    → Django (Railway)
```

---

## 2 · Onde hospedar

**Railway**, no mesmo projeto do backend. Dos serviços já pagos, é o único que roda WordPress: a Vercel não tem PHP nem disco persistente, a Cloudflare não hospeda.

**SQLite no lugar de MySQL.** O banco vira um arquivo no volume — elimina o segundo serviço. Plugin `sqlite-database-integration`, do time de Performance do WordPress.

| | |
| --- | --- |
| Custo | ~US$ 10–15/mês contra US$ 35 de WordPress gerenciado |
| Maturidade do plugin | **"Under Development"**, ~3 mil instalações |
| Limite duro | **uma réplica só** — duas gravando corrompem o arquivo |
| Saída | trocar `DB_ENGINE` para `mysql` e subir um MariaDB; o `application.php` mantém os dois caminhos vivos |

⚠️ **Backup é seu.** Volume não é backup. `railway volume files -v <vol> download /database/.ht.sqlite ./backup.sqlite` — o arquivo **é** o banco inteiro.

---

## 3 · A sequência

```
1. repo próprio (Bedrock) → GitHub
2. serviço no Railway a partir do repo
3. VOLUME montado em /data          ← antes do primeiro deploy
4. variáveis + salts novas
5. provisionar (instalar WP, tema, plugins)
6. rewrite na borda apontando o caminho
7. remover o que o WordPress substituiu
```

O passo 3 não pode ser esquecido: sem volume, banco e uploads morrem a cada deploy. O entrypoint aborta se `/data` não existir — falha visível é melhor que site em branco.

### Variáveis mínimas

```bash
DB_ENGINE=sqlite
DB_DIR=/data/database/          # 🔴 dentro do volume, não na imagem
WP_ENV=production               # decide indexação; qualquer outro valor = noindex
WP_HOME=https://clama.me/blog   # caminho PÚBLICO, nunca o host da origem
WP_SITEURL=https://clama.me/blog/wp
CLAMA_APP_URL=https://clama.me   # para os links que saem do WordPress
AUTH_KEY=... (8 salts distintas por ambiente)
```

---

## 4 · As armadilhas

Esta é a parte que vale repetir. **Seis bugs foram para produção, e cinco eram invisíveis fora do ambiente real.**

### 4.1 · A Vercel recusa `vercel.json` com chave desconhecida

Comentário em JSON de config quebra o deploy:

```
should NOT have additional property "_comentario_trailing_slash"
```

Falha **na validação, antes do build**. E o efeito foi indireto e caro: o frontend novo nunca subiu, enquanto o backend já tinha subido — as duas metades da migração de autenticação ficaram fora de sincronia e o login quebrou.

> **Regra:** `vercel.json` não aceita comentário. A explicação vai para o teste ou para a doc.

### 4.2 · `trailingSlash` é global e as duas camadas discordam

O WordPress usa permalink sem barra final; **toda rota do Django termina com barra**. Declarar `trailingSlash: false` alinhou o blog e quebrou a API inteira:

```
/api/csrf/  →  308  →  /api/csrf
```

Em `POST` isso destrói o fluxo. O sintoma visível era "troco a senha e caio na tela de login".

> **Regra:** enquanto `/api` e `/blog` tiverem convenções opostas, não existe config global que sirva às duas. Resolva por rota.

### 4.3 · `:path*` não casa caminho com barra final

```
/api/csrf   →  301   (chegou no Django)
/api/csrf/  →  200 text/html   (catch-all serviu o SPA)
```

A regra existia e nunca pegava a forma que o cliente usa. Trocada por `/api/:caminho(.*)`.

> **Regra:** use `:nome(.*)`. E teste **com e sem** barra.

### 4.4 · Arquivo estático tem precedência sobre rewrite

`/blog` continuou no app mesmo com a regra certa: o Vike pré-renderizava `dist/client/blog/index.html`, e a Vercel serve estático antes de avaliar rewrite.

A pista foi a assimetria — `/blog/wp/wp-admin` **chegava** no WordPress, porque não havia arquivo correspondente.

> **Regra:** o build não pode emitir arquivo no caminho que você quer proxiar.

### 4.5 · Client Routing engole o clique

Depois de remover as rotas do blog, clicar em "Blog" trocava a URL e **não saía do app**. O router do Vike intercepta link de mesma origem, e sobrou só o catch-all para casar.

O servidor respondia 200 corretamente o tempo todo. **`curl` mostrava tudo verde enquanto o botão não funcionava.**

> **Regra:** roteamento se testa clicando, não com `curl`. Marque um `window.__x` antes do clique — se sobreviver, não houve navegação real.

### 4.6 · Remover páginas pode desligar o pré-render inteiro

Com o blog fora, `vike prerender` passou a sair com **código 0 e não gerar arquivo nenhum**. Sem `dist/client/index.html`, o catch-all aponta para um arquivo inexistente e **o site inteiro cai** — build verde, deploy verde, site fora.

A causa: `prerender.enable` era `false` na raiz e funcionava de carona, porque as páginas do blog opinavam `true` individualmente.

> **Regra:** depois de remover páginas, confira o conteúdo de `dist/` antes de empurrar.

### 4.7 · Composer como root desabilita plugins em silêncio

No build de container:

```
Composer plugins have been disabled for safety in this non-interactive session.
```

O `roots/wordpress-core-installer` é um plugin — é ele que move o core para `web/wp`. Sem `COMPOSER_ALLOW_SUPERUSER=1`, o build passa, a imagem sobe, o Apache atende, e a primeira requisição devolve `Failed to open stream: wp-blog-header.php`.

### 4.8 · Healthcheck é impossível com `WP_HOME` público

O WordPress responde **302 para o caminho público** em qualquer requisição que chegue pelo host da origem — inclusive a do healthcheck, que trata 302 como falha e derruba o deploy.

Isso é o canonical absoluto funcionando: a origem não se apresenta como destino. Consequência: **sem `healthcheckPath`**; confira saúde por log.

### 4.9 · Um plugin por comando

`wp plugin activate a b` aborta no meio e o segundo nunca ativa, sem erro visível. O sintoma foi o tema subir e o Rank Math não — a única pista era a ausência do namespace `rankmath` no `/wp-json`.

E o Rank Math tem que ser ativado **antes** do `rewrite flush`: as regras do sitemap são registradas na ativação; invertendo, `sitemap_index.xml` dá 404 sem nada indicar o motivo.

---

## 5 · Integração com o Django

Só necessária se o produto precisar de identidade ou dado do app. Para conteúdo puro, pule esta seção inteira.

**A regra que sustenta tudo:** o cookie de sessão é `HttpOnly` com escopo `Path=/api`. O servidor WordPress **nunca recebe a credencial** — não porque esteja bem guardada, mas porque não passa por lá.

O widget que roda dentro da página do WordPress faz as chamadas autenticadas no navegador, com `credentials: "include"`. O CSRF vem de `GET /api/csrf/` e fica **só em memória**: gravar em storage recriaria o problema que o desenho resolve.

⚠️ **Buraco conhecido, ainda aberto:** o emissor de webhook no WordPress **não existe**. O lado receptor foi construído inteiro no Django — endpoint, HMAC, task, 48 testes — e nada dispara do outro lado. Sem ele o Django só descobre um post quando alguém acessa, e nunca sabe de despublicação, troca de slug ou exclusão.

Se o próximo produto precisar de sincronia, **construa o emissor primeiro**: `wp_remote_post` no `transition_post_status`, assinado com HMAC.

---

## 6 · Checklist de corte

Antes de apontar o caminho para o WordPress:

| | |
| --- | --- |
| ☐ | Volume montado, e um redeploy provou que o dado sobrevive |
| ☐ | `WP_HOME` é o caminho público, não o host da origem |
| ☐ | `WP_ENV=production` (qualquer outro valor = `noindex`) |
| ☐ | Nenhum arquivo estático do build no caminho a proxiar |
| ☐ | Links do tema para o app usam URL declarada, não caminho relativo |
| ☐ | Regras testadas **com e sem** barra final |
| ☐ | Navegação testada **clicando**, não com `curl` |
| ☐ | `dist/` inspecionado depois de remover páginas |
| ☐ | Backup do banco baixado para fora do Railway |

---

## 7 · Se subir backend e frontend juntos

Quando a mudança atravessa as duas pontas — foi o caso aqui, com a migração de autenticação:

**Eles precisam ir na mesma janela.** Se só um for, a autenticação quebra no intervalo: o servidor espera cookie e o cliente manda header, ou o contrário. Não é degradação, é login quebrado para todo mundo.

E **confirme os dois deploys**. O erro que me custou mais caro hoje foi monitorar o Railway commit a commit e presumir a Vercel. O deploy dela falhou na validação do `vercel.json`, e eu só descobri quando o login já estava quebrado em produção.

> Verifique o estado real de cada deploy antes de considerar concluído. Nos dois lados, sempre.
