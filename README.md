# alabventure.com — landing page

Site estático servido pela Vercel. `/blog` não mora aqui: é WordPress, atrás de um
rewrite na borda. Não existe CMS neste repositório — não existe banco, sessão,
build nem framework. Existe **uma** função: `api/contato.js`, que despacha o
formulário da página de contato.

O desenho e as armadilhas estão em [playbook-produto-em-wordpress.md](playbook-produto-em-wordpress.md);
este README é só a parte que é específica da A.lab.

---

## Topologia

```text
alabventure.com/*        → estas páginas estáticas (Vercel, sem build)
alabventure.com/blog/*   → WordPress (Railway)
```

O `public/` é servido cru — `outputDirectory: "public"` com `framework: null` no
`vercel.json`. Nenhum arquivo é gerado, então nada pode aparecer em `/blog` e
roubar a precedência do rewrite (armadilha §4.4 do playbook).

| Arquivo | URL | O quê |
| --- | --- | --- |
| `public/index.html` | `/` | home |
| `public/metodologia.html` | `/metodologia` | as quatro fases |
| `public/modalidades.html` | `/modalidades` | os dois modelos de aquisição |
| `public/produtos.html` | `/produtos` | as ventures (era `/portfolio`, que agora redireciona com 301 no `vercel.json`) |
| `public/por-que-alab.html` | `/por-que-alab` | os diferenciais |
| `public/contato.html` | `/contato` | formulário e canais diretos |
| `public/faq.html` | `/faq` | perguntas frequentes, com `FAQPage` |
| `public/termos-de-uso.html` | `/termos-de-uso` | jurídico |
| `desativado/politica-de-privacidade.html` | — | jurídico (LGPD), fora do ar: fora de `public/`, links e sitemap comentados |
| `public/mapa-do-site.html` | `/mapa-do-site` | sitemap HTML |
| `public/sitemap.xml` | `/sitemap.xml` | sitemap XML das páginas acima |
| `public/robots.txt` | `/robots.txt` | regras de rastreio + os dois sitemaps |
| `api/contato.js` | `/api/contato` | a única rota dinâmica: recebe o formulário |
| `public/lp.css` | — | o estilo inteiro, das dez páginas |
| `public/icon.svg` | — | favicon |
| `public/og.png` | — | imagem Open Graph 1200×630, referenciada em absoluto no `<head>` |

O `.html` some da URL por causa do `"cleanUrls": true` no `vercel.json`. Não
existe `trailingSlash` na configuração, e não pode existir: o WordPress do
`/blog` serve URLs **com** barra final, e `trailingSlash: false` redirecionaria
`/blog/algum-post/` para fora do lugar.

## Uma página deixou de ser uma página

Até agosto de 2026 o site inteiro era o `index.html`, com as seções em âncoras
(`#metodologia`, `#modalidades`, …). Cada área virou uma URL própria porque
âncora não é página: o Google indexa uma URL só, e `title`, `description` e
`h1` são um par por documento — não por seção.

O que ficou de dívida com essa mudança:

- **Menu e rodapé estão copiados em cada arquivo.** É o preço de não ter build.
  Mudar um link do menu é mudar dez arquivos — `sed -i '' 's/velho/novo/g'
  public/*.html` resolve, mas confira o diff antes de commitar.
- **As âncoras antigas ainda pousam certo.** Os cards da home carregam os `id`
  originais, então um `/#metodologia` guardado por alguém rola até o resumo da
  área em vez de cair no vazio.
- **O menu no celular virou faixa rolável.** Antes ele era `display: none` abaixo
  de 980px, o que era tolerável quando tudo vivia na mesma página. Com o
  conteúdo espalhado em dez URLs, esconder o menu deixaria o celular sem
  navegação.

## A linha que aponta o `/blog`

Trocar o dono de `/blog` é editar o host nas duas regras do `vercel.json`:

```json
{ "source": "/blog",             "destination": "https://<host-do-railway>/" },
{ "source": "/blog/:caminho(.*)", "destination": "https://<host-do-railway>/:caminho" }
```

Hoje o host é `blog-production-b190.up.railway.app` — serviço `blog` do projeto
`alab` no Railway, que builda a partir de `PedroVasconcelos18/alab-wordpress`.

Duas regras, não uma: `/blog/:caminho(.*)` não casa `/blog` sem barra. E é
`:caminho(.*)`, nunca `:caminho*` — a forma com `*` não casa caminho terminado em
barra, que é justamente a que o navegador manda (§4.3).

O prefixo `/blog` **é removido** ao chegar na origem: o WordPress vive na raiz do
serviço do Railway e é o `WP_HOME=https://www.alabventure.com/blog` que faz ele emitir
os links públicos certos. Não inverta isso — origem que se apresenta como destino
vaza o hostname do Railway nos links.

⚠️ O `vercel.json` **rejeita chave desconhecida** e falha na validação, antes do
build (§4.1). Comentário explicativo vai neste README, nunca no JSON.

## Apex e `www`: resolvido no `www`, e não era cosmético

O site canônico é **`www.alabventure.com`**. O apex responde 307 para ele, que é
o primário na Vercel.

Isso já foi tratado aqui como "funciona, só custa um redirect". **Estava
errado.** Com o `WP_HOME` do blog no apex e a página servida no `www`, toda URL
REST que o WordPress gera aponta para o apex — e navegador **não segue redirect
em preflight de CORS**:

```text
Access to fetch at 'https://alabventure.com/blog/wp-json/...'
from origin 'https://www.alabventure.com' — blocked by CORS policy:
Redirect is not allowed for a preflight request.
```

Quebrava de verdade: a curtida não registrava, e o `wp-admin` perdia
`users/me` e estourava `SecurityError` no `replaceState`. Nada disso aparece em
`curl`, e nada aparece em ambiente local, onde não existe a divisão apex/www.

Então tudo aponta para `www` agora: `WP_HOME`, `WP_SITEURL`, e o `canonical` /
`og:url` / `og:image` desta LP.

> Se um dia o apex for preferido, a troca é nos dois lados **juntos**: primário
> na Vercel e as duas variáveis no Railway. Meio caminho é o bug acima.

## O formulário de contato

`POST /api/contato` valida o payload e manda um e-mail pelo **Resend** — a mesma
conta e o mesmo remetente verificado que o blog usa (`nao-responda@alabventure.com`).
Nada é gravado em lugar nenhum: a caixa de entrada é o banco de dados.

O `reply_to` é o e-mail de quem escreveu. Responder no cliente de e-mail responde
para a pessoa, não para o remetente automático.

### Variáveis de ambiente

| Variável | Obrigatória | Padrão |
| --- | --- | --- |
| `ALAB_RESEND_CHAVE` | **sim** | — |
| `ALAB_EMAIL_REMETENTE` | não | `nao-responda@alabventure.com` |
| `ALAB_CONTATO_DESTINO` | não | `contato@alabventure.com` |

A chave é a mesma do blog (`ALAB_RESEND_CHAVE` no Railway). Em produção ela vai
em Vercel → Settings → Environment Variables; local, no `.env.local`, que o
`.gitignore` cobre.

**Sem a chave a função responde 503 e o site diz que não conseguiu enviar, com o
e-mail direto na tela.** Nunca responde "recebemos" para um lead que ninguém vai
ler — um formulário que engole contato em silêncio é pior que formulário nenhum.

### O que segura spam

Três coisas, nenhuma delas um captcha:

- um campo-isca (`botcheck`) invisível na tela, mas não `display:none` — há robô
  que ignora campo escondido por display e preenche o resto;
- tempo mínimo de preenchimento (2s), medido **no cliente** e enviado como
  duração, para não depender do relógio do visitante bater com o do servidor;
- limites de tamanho por campo, iguais no HTML e no servidor.

As duas primeiras falham de formas **deliberadamente diferentes**. A isca é
invisível: humano nenhum a preenche, falso positivo é impossível, então ela
devolve `200 {ok:true}` e descarta em silêncio — contar ao robô que a armadilha
funcionou é ensinar a próxima tentativa a desviar dela. O cronômetro erra em
gente de verdade (autofill mais um clique cabem em dois segundos), então devolve
`400` com "clique em enviar outra vez", que um humano resolve e um lead não se
perde calado.

Se spam virar problema de verdade, o próximo passo é Turnstile ou um limite por
IP em KV — serverless sem estado não tem como limitar taxa sozinho.

## O que ainda falta preencher

Os dados cadastrais continuam escritos com marcador no lugar do dado real.
Buscar por eles antes de qualquer deploy:

```bash
grep -rn 'PREENCHER\|RAZÃO SOCIAL' public/
```

| Marcador | Onde | O que colocar |
| --- | --- | --- |
| `[RAZÃO SOCIAL COMPLETA]`, `[00.000.000/0001-00]`, endereço, comarca, encarregado (nome e e-mail), datas de atualização e vigência, prazo de sigilo da 8.5 | `termos-de-uso.html` | dados cadastrais e o encarregado de LGPD |

Os marcadores jurídicos são renderizados em âmbar, com a classe `.todo` — se
alguém publicar sem preencher, aparece na tela.

As redes sociais deixaram de ser pendência. A regra que valia — **sem URL,
não há link** — foi cumprida do jeito certo: os perfis chegaram, então os
`<span class="soc-vazio">` viraram `<a target="_blank" rel="noopener me">` e o
`sameAs` voltou ao `Organization` de `index.html` e `contato.html`.

| Rede | URL |
| --- | --- |
| Instagram | `https://www.instagram.com/alab.vbuilder/` |
| YouTube | `https://www.youtube.com/@alab.venture` |

O LinkedIn foi removido: não há perfil, e ícone de rede que não existe é pior
do que ausência. A classe `.soc-vazio` saiu do `lp.css` junto — não sobrou
nenhum item sem `href` para estilizá-la. Se algum dia entrar uma rede nova sem
URL confirmada, a regra continua de pé: não entra até o link existir.

## Rodar local

Não tem `npm install` — é HTML, CSS e uma função.

```bash
vercel dev --listen 8000      # http://localhost:8000
```

`vercel dev` é o único jeito de testar o formulário e as URLs sem `.html`: ele
roda a função e aplica o `cleanUrls`. Precisa da chave no `.env.local`:

```bash
grep '^ALAB_RESEND_CHAVE=' ../alab-wordpress/.env.railway >> .env.local
```

Para mexer só em HTML e CSS, o servidor burro continua servindo:

```bash
python3 -m http.server 8000 --directory public
```

Aí o `.html` fica visível na URL, os links do menu dão 404 e `/api/contato` não
existe — nada disso é bug, é a Vercel que não está no meio.

`/blog` não funciona em nenhum dos dois: o rewrite é da Vercel em produção. Para
testar o blog junto, suba o WordPress e acesse pelo domínio de preview.

## Checklist antes de apontar o `/blog`

Adaptado do §6 do playbook — o que é específico daqui:

- [ ] Serviço WordPress no ar no Railway, com **volume montado em `/data`**, e um
      redeploy provou que o dado sobreviveu
- [ ] `WP_HOME=https://www.alabventure.com/blog` (o caminho público, não o host da origem)
- [ ] `WP_SITEURL=https://www.alabventure.com/blog/wp`
- [ ] `WP_HOME` no MESMO host que serve a página (apex vs `www` quebra CORS do REST)
- [ ] `WP_ENV=production` — qualquer outro valor deixa o blog `noindex`
- [ ] Host real no `vercel.json` (as duas regras)
- [ ] Testado **com e sem** barra final: `/blog`, `/blog/`, `/blog/algum-post/`
- [ ] Testado **clicando** no link "Blog" do menu, não só com `curl`
- [ ] Backup do banco baixado para fora do Railway

## O que foi removido, e o que quebrou junto

O blog/CMS em Next.js + Supabase (posts, admin, login, comentários, curtidas)
saiu inteiro. Com ele saíram o `package.json`, o `next.config.ts`, o middleware de
sessão e as migrations. Consequências que ficam:

- **`/entrar`, `/cadastro`, `/admin`, `/recuperar-senha`, `/redefinir-senha`
  respondem 404.** O botão "Entrar" saiu do menu; nenhum link interno aponta para lá.
- **Os posts antigos não migram sozinhos.** URL `/blog/<slug>` só volta a responder
  quando existir um post com o mesmo slug no WordPress.
- **O projeto Supabase continua de pé e cobrando.** Exporte o que quiser guardar e
  apague o projeto — nada aqui usa mais.
- **A imagem OG virou arquivo.** Era gerada em runtime por uma rota edge do Next
  (`/og`); agora é `public/og.png`, com o mesmo desenho. Mudou o caminho: quem
  tinha `/og` cacheado precisa recompartilhar.
