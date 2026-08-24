# Playbook: colocar um produto em WordPress sob um domínio existente

Como o blog foi para o ar, escrito para ser repetido. Tudo aqui foi executado e verificado em produção — não é plano, é registro.

**Duas execuções até agora.** A primeira, `clama.me/blog`, com um app React dono do resto do domínio e um Django em `/api`. A segunda, `alabventure.com/blog`, com uma landing estática e nenhum backend. A segunda execução **corrigiu uma causa que a primeira tinha diagnosticado errado** (§4.8) e revelou oito armadilhas que a primeira não tinha como ver — a maioria porque só aparecem quando existe um domínio real, um proxy real e uma pessoa real se cadastrando.

> A numeração das armadilhas **nunca é reaproveitada**. Documentação de outros repositórios cita §4.3, §4.4, §4.5, §4.9. Armadilha nova entra no fim.

---

## 1 · A decisão de topologia

**Subdiretório, não subdomínio.** `dominio.com/blog`, não `blog.dominio.com`.

O ganho é de SEO: subdiretório herda a autoridade do domínio. O custo é que as duas aplicações passam a dividir origem — e é daí que vem quase toda a complexidade das seções seguintes.

O mecanismo é **Strangler Fig**: um rewrite na borda decide quem atende cada caminho. Trocar o dono de `/blog` é mudar uma linha; reverter também.

```text
dominio.com/*        → app (Vercel)
dominio.com/blog/*   → WordPress (Railway)
dominio.com/api/*    → backend (Railway)
```

🔴 **Decida o host canônico antes de qualquer coisa.** Apex ou `www`, um só, e o mesmo em todas as camadas. Isso parece detalhe de SEO e não é: com os dois desalinhados, o navegador recusa as chamadas REST do próprio WordPress (§4.11).

---

## 2 · Onde hospedar

**Railway**, no mesmo projeto do backend quando existe um. Dos serviços já pagos, é o único que roda WordPress: a Vercel não tem PHP nem disco persistente, a Cloudflare não hospeda.

**SQLite no lugar de MySQL.** O banco vira um arquivo no volume — elimina o segundo serviço. Plugin `sqlite-database-integration`, do time de Performance do WordPress.

| | |
| --- | --- |
| Custo | ~US$ 10–15/mês contra US$ 35 de WordPress gerenciado |
| Maturidade do plugin | **"Under Development"**, ~3 mil instalações |
| Limite duro | **uma réplica só** — duas gravando corrompem o arquivo |
| Saída | trocar `DB_ENGINE` para `mysql` e subir um MariaDB; o `application.php` mantém os dois caminhos vivos |

### Backup é seu, e o comando tem uma armadilha

Volume não é backup. O arquivo **é** o banco inteiro: posts, usuários, e-mails, hashes de senha, comentários.

🔴 **Dê ao volume um nome único no seu Railway inteiro.** O `railway volume` resolve o nome dentro do projeto vinculado ao **diretório atual**, e não pergunta nada. Com dois projetos usando `blog-volume`, rodar do diretório errado baixou o banco do outro site — mesmo comando, mesma mensagem de `Downloaded`, arquivo de outro produto. Restaurar aquilo teria sobrescrito o site certo com dados do errado.

Nome de volume é rótulo: renomear não mexe no `mountPath` nem no dado. Com nomes distintos, o comando errado **falha** em vez de acertar o alvo errado.

```bash
cd <repo-do-blog>            # ← o passo que não pode faltar
railway status               # confirme o projeto
railway volume files -v <nome-unico> download /database/.ht.sqlite ./backup-$(date +%F).sqlite
```

**Abra o que baixou.** Backup que ninguém abriu não é backup, e é assim que se descobre que veio do projeto errado:

```bash
sqlite3 backup.sqlite "PRAGMA integrity_check;"
sqlite3 backup.sqlite "SELECT user_login, user_email FROM wp_users;"
```

---

## 3 · A sequência

```text
1. repo próprio (Bedrock) → GitHub
2. serviço no Railway a partir do repo
3. VOLUME montado em /data          ← antes do primeiro deploy
4. variáveis + salts novas
5. provisionar (instalar WP, tema, plugins)
6. rewrite na borda apontando o caminho
7. remover o que o WordPress substituiu
```

O passo 3 não pode ser esquecido: sem volume, banco e uploads morrem a cada deploy. O entrypoint aborta se `/data` não existir — falha visível é melhor que site em branco.

⚠️ **Confirme que o push dispara deploy.** O Railway builda de um repo sem que o GitHub App necessariamente o enxergue: dá para conectar a origem com `--branch` explícito e ficar **sem gatilho**. O sintoma é silencioso — o push sobe, o deploy não. Se a CLI recusa conectar sem `--branch`, é esse o caso: libere o repo em *GitHub › Settings › Applications › Railway*.

### Variáveis mínimas

```bash
DB_ENGINE=sqlite
DB_DIR=/data/database/                    # 🔴 dentro do volume, não na imagem
WP_ENV=production                         # decide indexação; qualquer outro valor = noindex
WP_HOME=https://www.dominio.com/blog      # caminho PÚBLICO, e o MESMO host que serve a página (§4.11)
WP_SITEURL=https://www.dominio.com/blog/wp
APP_URL=                                  # vazio em produção; a landing é a raiz do mesmo domínio
LOCALE=pt_BR                              # §4.12 — não funciona como constante do wp-config
TIMEZONE=America/Sao_Paulo                # §4.13 — o default é UTC e ninguém percebe
RESEND_CHAVE=re_...                       # §4.14 — API HTTP, não SMTP
EMAIL_REMETENTE=nao-responda@dominio.com  # domínio verificado no provedor
AUTH_KEY=... (8 salts distintas por ambiente)
```

---

## 4 · As armadilhas

Esta é a parte que vale repetir.

A primeira execução produziu **4.1 a 4.9**. A segunda produziu **4.10 a 4.17**, e quase todas eram invisíveis fora de produção: dependem de um proxy real, de dois hosts, de um provedor de e-mail, ou de alguém logando de verdade.

### 4.1 · A Vercel recusa `vercel.json` com chave desconhecida

Comentário em JSON de config quebra o deploy:

```text
should NOT have additional property "_comentario_trailing_slash"
```

Falha **na validação, antes do build**. E o efeito foi indireto e caro: o frontend novo nunca subiu, enquanto o backend já tinha subido — as duas metades da migração de autenticação ficaram fora de sincronia e o login quebrou.

> **Regra:** `vercel.json` não aceita comentário. A explicação vai para o teste ou para a doc.

⚠️ **Isso NÃO se transfere para o `railway.json`.** Medido na segunda execução: chaves-comentário (`_leia`, `_semHealthcheck`) foram lidas e ignoradas, e o deploy trouxe `configFile` e `builder` corretos. São validadores diferentes; não generalize de um para o outro em nenhuma direção.

### 4.2 · `trailingSlash` é global e as duas camadas discordam

O WordPress usa permalink sem barra final; **toda rota do Django termina com barra**. Declarar `trailingSlash: false` alinhou o blog e quebrou a API inteira:

```text
/api/csrf/  →  308  →  /api/csrf
```

Em `POST` isso destrói o fluxo. O sintoma visível era "troco a senha e caio na tela de login".

> **Regra:** enquanto `/api` e `/blog` tiverem convenções opostas, não existe config global que sirva às duas. Resolva por rota.

### 4.3 · `:path*` não casa caminho com barra final

```text
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

```text
Composer plugins have been disabled for safety in this non-interactive session.
```

O `roots/wordpress-core-installer` é um plugin — é ele que move o core para `web/wp`. Sem `COMPOSER_ALLOW_SUPERUSER=1`, o build passa, a imagem sobe, o Apache atende, e a primeira requisição devolve `Failed to open stream: wp-blog-header.php`.

### 4.8 · Sem `healthcheckPath` — mas a causa não é o `WP_HOME`

A conclusão continua valendo: **não configure `healthcheckPath`**, confira saúde por log (o Apache registra `AH00163` ao subir).

🔴 **A causa que a primeira execução registrou estava errada.** Não é o `WP_HOME` público devolvendo 302 para quem chega pelo host da origem — medido na segunda execução, a origem **serve 200** para qualquer host e só declara o destino no `<link rel="canonical">`.

O que derruba o healthcheck é a **porta**. O Railway bate em `http://<host-interno>:$PORT/`, com a porta explícita no `Host`, e o `redirect_canonical` responde **301 para a mesma URL sem a porta**. Medido: `http://localhost:8081/` → `301 http://localhost/`; a mesma requisição com `Host` sem porta → `200`.

A distinção importa porque a causa errada sugere um conserto errado — mexer no `WP_HOME` — que não resolveria nada e quebraria os links públicos.

### 4.9 · Um plugin por comando

`wp plugin activate a b` aborta no meio e o segundo nunca ativa, sem erro visível. O sintoma foi o tema subir e o Rank Math não — a única pista era a ausência do namespace `rankmath` no `/wp-json`.

E o Rank Math tem que ser ativado **antes** do `rewrite flush`: as regras do sitemap são registradas na ativação; invertendo, `sitemap_index.xml` dá 404 sem nada indicar o motivo.

### 4.10 · A requisição que chega na origem não é a que o cliente fez

Medido nas duas pontas:

```text
cliente  →  GET /blog/wp/wp-admin/   Host: www.dominio.com
origem   ←  GET /wp/wp-admin/        Host: blog-production-….up.railway.app
```

A Vercel troca o `Host` pelo da origem **e remove o prefixo `/blog`**. Tudo que passa por `WP_HOME` sai certo sozinho — o HTML servido não tem uma única ocorrência do host da origem. O que sai errado é o código que lê `$_SERVER` cru: `auth_redirect()` monta o destino com `HTTP_HOST . REQUEST_URI`, e vários formulários do wp-admin usam `REQUEST_URI` como action.

⚠️ **Consertar só o host troca um defeito por outro.** Corrigido o host, o destino vira `dominio.com/wp/wp-admin/` — sem o `/blog`. Os dois valores precisam ser reconstruídos **juntos**, e aí o WordPress volta ao caso normal de instalação em subdiretório, que o `WP::parse_request()` trata sozinho.

> **Regra:** reconstrua host **e** prefixo no `wp-config`, a partir do `WP_HOME`. E preserve a porta ao fazer isso — `parse_url(..., PHP_URL_HOST)` devolve `localhost` para `http://localhost:8080`, e host sem porta põe o site em loop de redirect. Produção não tem porta na URL e nunca mostra esse bug; o container local mostra na primeira subida.

Isso também **encerra a ideia de `X-Robots-Tag` por host** para esconder a origem: requisição proxiada e visita direta chegam idênticas. Não há host para distinguir — não é arriscado, é impossível.

### 4.11 · Apex e `www` quebram o preflight de CORS

O mais caro da segunda execução, e o que passou mais tempo classificado como cosmético.

Com o `WP_HOME` no apex e a página servida no `www`, **toda URL REST que o WordPress gera aponta para o apex**, que responde 307. E navegador **não segue redirect em preflight**:

```text
Access to fetch at 'https://dominio.com/blog/wp-json/...'
from origin 'https://www.dominio.com' — blocked by CORS policy:
Redirect is not allowed for a preflight request.
```

Quebrava de verdade: a curtida não registrava, e o **wp-admin** perdia `users/me` e estourava `SecurityError` no `replaceState`.

Nada disso aparece em `curl`, que não faz preflight. E nada aparece em ambiente local, onde a divisão apex/www não existe.

> **Regra:** o `WP_HOME` tem que estar no **mesmo host que serve a página**. Se um dia trocar o canônico, troque nos dois lados na mesma janela: o primário na borda e as variáveis na origem. Meio caminho é este bug.

### 4.12 · O idioma não se define pelo `wp-config`

Definir `WPLANG` como constante **não funciona**, e falha em silêncio. O motivo está no core:

```php
$db_locale = get_option( 'WPLANG' );
if ( false !== $db_locale ) {
    $locale = $db_locale;
}
```

É `false !==`, não `if ( $db_locale )`. A opção **existe** desde a instalação, com valor vazio — então ela sobrescreve a constante com `''` e o `empty()` logo abaixo devolve `en_US`. A constante só valeria se a linha não existisse no banco, que nunca é o caso.

Pelo painel também não: o dropdown lista apenas idioma **já instalado**, e `DISALLOW_FILE_MODS` — a mesma trava que impede plugin instalado pelo painel de sumir no deploy seguinte — proíbe o WordPress de baixar. Sem pacote na imagem, a única opção é English.

> **Regra:** são duas peças. Baixe os `.mo` **no build** (a versão de cada pacote lida do que está instalado, não escrita à mão) e aponte a opção `WPLANG` uma vez, no boot, **só quando estiver vazia** — assim trocar o idioma pelo painel continua valendo.

### 4.13 · O que o instalador gravou em inglês fica em inglês

Trocar o idioma não conserta, e o resultado meio-traduzido é pior que o inglês inteiro: **"agosto 8, 2026"** — mês em português, gramática em inglês.

O instalador grava `__('F j, Y')`, `__('g:i a')` e o nome da categoria padrão traduzidos pelo locale **ativo na hora da instalação**. Viraram texto no banco, e nenhuma troca de idioma depois mexe neles.

E o fuso é pior porque é silencioso: o default é UTC, então toda hora de publicação sai adiantada sem nada indicar.

> **Regra:** no boot, pergunte ao próprio WordPress qual é o formato do locale (`wp eval "echo __('F j, Y');"`) e troque **só o que ainda for o default inglês**. Assim não há nada específico de um idioma escrito no script, e formato ajustado no painel é respeitado.

### 4.14 · O PaaS não deixa sair SMTP — e o sintoma é pendurar, não falhar

Com `smtp.provedor.com:587`, qualquer envio **pendurava a requisição por 90 segundos**. Pior que não ter e-mail: cadastro e recuperação de senha ficam travados até o `max_execution_time`.

E o gancho `wp_mail_failed` **nunca dispara**, porque o envio não falha — ele trava.

Medido nas duas pontas antes de trocar: a mesma porta conecta da máquina de desenvolvimento em 0,22s e devolve o banner SMTP; do container, não conecta.

> **Regra:** use a **API HTTP** do provedor, na 443, via `pre_wp_mail`. Nenhum PaaS bloqueia 443, o PHPMailer nem é carregado, e não existe socket para pendurar. Ponha timeout curto e registre o corpo do erro do provedor — é ele que diz a causa real (domínio não verificado, remetente recusado, chave inválida).

⚠️ A imagem `php:*-apache` **não tem MTA**. Sem configurar transporte, `wp_mail()` devolve `false` calado: quem se cadastra nunca recebe a senha, e ninguém é avisado.

### 4.15 · Trocar a paleta do tema pai deixa `var()` morto

Um tema filho que substitui a paleta inteira do pai deixa o **CSS do pai** pedindo slugs que não existem mais. E `var()` que não resolve **não é erro**: a propriedade cai para o valor herdado, em silêncio.

Medido: 29 tokens referenciados, 25 definidos. Os quatro mortos quebravam a borda dos campos de comentário, o hover e o anel de foco dos botões, e a cor da data e do nome do autor. O sintoma era uma borda branca onde o código pedia `rgba(196,205,217,.18)`.

> **Regra:** compare o que aparece em `var()` com o que sua paleta define, no HTML **servido**, e alie os slugs do pai aos seus. Refaça a conta ao atualizar o tema pai.

### 4.16 · mu-plugin em diretório não carrega sozinho

O WordPress autoloada apenas **arquivos** soltos em `mu-plugins/`. O Composer instala mu-plugin como **diretório**, e sem o arquivo do autoloader do Bedrock nada dentro dele roda.

Consequência medida: `bedrock-disallow-indexing` **nunca carregou, em nenhum ambiente**. Com `WP_ENV=development` e `DISALLOW_INDEXING` valendo `true`, a página servia `index, follow`.

Invisível em produção justamente porque lá a constante é `false` — o comportamento certo e o quebrado são indistinguíveis.

> **Regra:** confirme a proteção onde ela **deveria agir**, não onde ela é no-op. Suba o ambiente de desenvolvimento e confira o `<meta name="robots">`.

### 4.17 · O `wp-login.php` não passa pelo tema, e joga o leitor no wp-admin

Se o produto tiver contas de leitor, duas coisas:

**A tela.** O `wp-login.php` é arquivo do core, com CSS próprio, e ignora o `theme.json` inteiro. O blog fica vestido e o cadastro continua cinza com o logo do WordPress — a primeira tela que um leitor vê ao decidir comentar, e a única em que ele digita uma senha. Os ganchos são `login_enqueue_scripts`, `login_head` (não `wp_head`), `login_headerurl` e `login_message`.

**O destino.** O padrão joga **qualquer** usuário autenticado no painel: sem `redirect_to`, um assinante recém-cadastrado cai em `wp-admin/profile.php`. São quatro portas, e fechar só a primeira é decoração:

| | |
| --- | --- |
| `login_redirect` | manda o leitor para o blog — preservando um `redirect_to` explícito, que é o que faz "curtir deslogado" voltar para o post |
| `admin_init` | barra a URL digitada à mão |
| `show_admin_bar` | tira a barra preta do topo |
| `edit_profile_url` | e a linha "Edite seu perfil" do formulário de comentário |

> **Regra:** a linha de corte é a capacidade **`edit_posts`**, não papel nem lista de nomes. E deixe `admin-ajax.php` **fora** do bloqueio: mora em wp-admin mas é o endpoint que o frontend usa.

⚠️ Bloquear o perfil significa que o leitor não troca a senha logado. O caminho passa a ser "Perdeu a senha?", que depende do §4.14 funcionando.

---

## 5 · Integração com o backend

Só necessária se o produto precisar de identidade ou dado do app. Para conteúdo puro, pule esta seção inteira — a segunda execução não precisou de nada disto.

**A regra que sustenta tudo:** o cookie de sessão é `HttpOnly` com escopo `Path=/api`. O servidor WordPress **nunca recebe a credencial** — não porque esteja bem guardada, mas porque não passa por lá.

O widget que roda dentro da página do WordPress faz as chamadas autenticadas no navegador, com `credentials: "include"`. O CSRF vem de `GET /api/csrf/` e fica **só em memória**: gravar em storage recriaria o problema que o desenho resolve.

⚠️ **Buraco conhecido, ainda aberto:** o emissor de webhook no WordPress **não existe**. O lado receptor foi construído inteiro no Django — endpoint, HMAC, task, 48 testes — e nada dispara do outro lado. Sem ele o Django só descobre um post quando alguém acessa, e nunca sabe de despublicação, troca de slug ou exclusão.

Se o próximo produto precisar de sincronia, **construa o emissor primeiro**: `wp_remote_post` no `transition_post_status`, assinado com HMAC.

---

## 6 · Checklist de corte

Antes de apontar o caminho para o WordPress:

| | |
| --- | --- |
| ☐ | Volume montado, **com nome único no Railway inteiro**, e um redeploy provou que o dado sobrevive |
| ☐ | `WP_HOME` é o caminho público **e o mesmo host que serve a página** (§4.11) |
| ☐ | `WP_ENV=production` (qualquer outro valor = `noindex`) |
| ☐ | Push no GitHub **dispara deploy** — confirmado empurrando, não presumido |
| ☐ | Nenhum arquivo estático do build no caminho a proxiar |
| ☐ | Links do tema para o app usam URL declarada, não caminho relativo |
| ☐ | Regras testadas **com e sem** barra final |
| ☐ | Navegação testada **clicando**, não com `curl` |
| ☐ | `dist/` inspecionado depois de remover páginas |
| ☐ | Idioma, formato de data e fuso conferidos no HTML **servido** (§4.12, §4.13) |
| ☐ | Nenhum token de cor morto no HTML servido (§4.15) |
| ☐ | Se houver contas: e-mail entregue de verdade, e o leitor não alcança o wp-admin (§4.14, §4.17) |
| ☐ | Backup baixado, **aberto e conferido** — usuário certo, projeto certo |

---

## 7 · Se subir backend e frontend juntos

Quando a mudança atravessa as duas pontas — foi o caso na primeira execução, com a migração de autenticação:

**Eles precisam ir na mesma janela.** Se só um for, a autenticação quebra no intervalo: o servidor espera cookie e o cliente manda header, ou o contrário. Não é degradação, é login quebrado para todo mundo.

E **confirme os dois deploys**. O erro mais caro daquele dia foi monitorar o Railway commit a commit e presumir a Vercel. O deploy dela falhou na validação do `vercel.json`, e só apareceu quando o login já estava quebrado em produção.

> Verifique o estado real de cada deploy antes de considerar concluído. Nos dois lados, sempre.

---

## 8 · Como testar

Duas coisas diferentes, e confundir as duas é como se chega em produção sem saber.

### O que já está no ar

Um script de fumaça **somente leitura** — só `GET` e `HEAD`, nada de `POST` — roda contra produção a qualquer hora, e o melhor momento é logo depois de um deploy. Cada teste dele existe porque a coisa quebrou; nenhum é preventivo genérico.

Três lições sobre escrever esse script, todas aprendidas errando:

- **Teste que passa numa página vazia mente.** "Nenhum token de cor morto" é verdade quando não há token nenhum; "sem `noindex`" é verdade sem `meta robots`. Exija a evidência antes de julgar.
- **Comparação de substring em URL codificada precisa decodificar antes.** Procurar `%2Fblog` casou dentro de `…%2F%2Fblog-production-1356…` — o host da origem começava com "blog-", e o teste passou **dentro do próprio bug**.
- **A régua é o que o site declara, não o que você digitou.** Compare com o `home` do `/wp-json`, não com o argumento da linha de comando.

E rode contra **um segundo site** com o mesmo desenho. Foi assim que os três defeitos acima apareceram — e, de quebra, dois bugs reais no primeiro site.

### Uma mudança, antes de subir

**Container, não `php -S`.** Os bugs mais caros desta imagem não existem fora do container: os dois MPMs do Apache, o Composer como root, o volume ausente, o pacote de idioma baixado no build. O `php -S` testa o tema; o container testa o deploy.

Volume **nomeado**, para o teste de persistência valer: derrubar e subir de novo tem que preservar o banco.

### O que nenhum dos dois pega

Clique e layout. `curl` fica verde enquanto o botão não sai do lugar (§4.5). Foi no navegador que apareceram o 404 de favicon, um desalinhamento de 52px entre a barra do blog e a da landing, campos de formulário brancos no escuro, e o §4.11 inteiro.
