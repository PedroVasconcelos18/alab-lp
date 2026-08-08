# alabventure.com — landing page

Site estático servido pela Vercel. `/blog` não mora aqui: é WordPress, atrás de um
rewrite na borda. Não existe CMS neste repositório — não existe banco, sessão,
build nem framework.

O desenho e as armadilhas estão em [playbook-produto-em-wordpress.md](playbook-produto-em-wordpress.md);
este README é só a parte que é específica da A.lab.

---

## Topologia

```text
alabventure.com/*        → esta LP estática (Vercel, sem build)
alabventure.com/blog/*   → WordPress (Railway)
```

O `public/` é servido cru — `outputDirectory: "public"` com `framework: null` no
`vercel.json`. Nenhum arquivo é gerado, então nada pode aparecer em `/blog` e
roubar a precedência do rewrite (armadilha §4.4 do playbook).

| Arquivo | O quê |
| --- | --- |
| `public/index.html` | a LP inteira, incluindo o Google Tag Manager (`GTM-KQD4V78Z`) |
| `public/lp.css` | o estilo inteiro |
| `public/icon.svg` | favicon |
| `public/og.png` | imagem Open Graph 1200×630, referenciada em absoluto no `<head>` |

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
serviço do Railway e é o `WP_HOME=https://alabventure.com/blog` que faz ele emitir
os links públicos certos. Não inverta isso — origem que se apresenta como destino
vaza o hostname do Railway nos links.

⚠️ O `vercel.json` **rejeita chave desconhecida** e falha na validação, antes do
build (§4.1). Comentário explicativo vai neste README, nunca no JSON.

## 🔴 Apex e `www` discordam hoje

Medido em produção: `alabventure.com/*` responde **307 para `www.alabventure.com`**
— o `www` é o domínio primário do projeto na Vercel. Mas o `<head>` desta LP
declara `canonical` e `og:url` no **apex**, e o `WP_HOME` do blog também. São
dois sinais opostos para o mesmo conteúdo.

Funciona assim mesmo: o `/blog` chega ao WordPress depois do 307. O custo é um
redirect em **todo link interno** que o WordPress emite, e um canonical que
aponta para uma URL que redireciona — exatamente o tipo de sinal ambíguo que a
escolha por subdiretório (§1 do playbook) existe para evitar.

Escolha um, e o outro segue:

| Se o primário for | Vercel | `WP_HOME` / `WP_SITEURL` | `public/index.html` |
| --- | --- | --- | --- |
| **apex** (o que os arquivos dizem hoje) | trocar o primário para `alabventure.com` | como está | como está |
| **www** | como está | prefixar `www.` | trocar `canonical` e `og:url` |

O primário é o toggle *Domains* do projeto na Vercel; o resto é uma variável no
Railway e duas linhas de HTML.

## Rodar local

Não tem `npm install` — é HTML e CSS.

```bash
python3 -m http.server 8000 --directory public   # http://localhost:8000
```

`/blog` não funciona local: o rewrite é da Vercel. Para testar o blog junto,
suba o WordPress e acesse pelo domínio de preview.

## Checklist antes de apontar o `/blog`

Adaptado do §6 do playbook — o que é específico daqui:

- [ ] Serviço WordPress no ar no Railway, com **volume montado em `/data`**, e um
      redeploy provou que o dado sobreviveu
- [ ] `WP_HOME=https://alabventure.com/blog` (o caminho público, não o host da origem)
- [ ] `WP_SITEURL=https://alabventure.com/blog/wp`
- [ ] `WP_ENV=production` — qualquer outro valor deixa o blog `noindex`
- [ ] Host real no `vercel.json` (as duas regras)
- [ ] Testado **com e sem** barra final: `/blog`, `/blog/`, `/blog/algum-post/`
- [ ] Testado **clicando** no link "Conteúdo" do menu, não só com `curl`
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
