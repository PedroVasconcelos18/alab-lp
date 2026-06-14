-- =====================================================================
-- SEED — 2 posts de exemplo para testar o /blog (Fase 3)
-- Rode no Supabase SQL Editor depois da migration 0001.
-- autor_id fica null (válido: a FK é "on delete set null"); quando o admin
-- existir, os posts criados pelo CMS já virão com autor_id preenchido.
-- Rode quantas vezes quiser: o "on conflict (slug)" evita duplicar.
-- =====================================================================

insert into posts (slug, titulo, excerpt, conteudo_md, categoria, tempo_leitura, status, publicado_em)
values
(
  'dimensionar-mercado-pre-seed',
  'Como dimensionar mercado para uma startup pré-seed sem inflar o TAM',
  'Uma análise crítica das armadilhas mais comuns no sizing de mercado early stage, e o método que usamos para entregar números defensáveis em diligência.',
  $md$
O sizing de mercado é onde a maioria dos decks pré-seed perde credibilidade. Não
porque os números são baixos — mas porque são **grandes demais para serem
defensáveis**.

## O problema do TAM inflado

Quando você escreve "o mercado é de R$ 50 bilhões", um investidor experiente
imediatamente desconta esse número. O que ele quer ver é o caminho:

- **TAM** — o mercado total, no mundo ideal.
- **SAM** — a fatia que seu modelo de fato atende.
- **SOM** — o que você consegue capturar nos próximos 3 anos.

> Um SOM honesto vale mais que um TAM impressionante.

## O método A.lab

1. Comece de baixo pra cima (bottom-up): nº de clientes × ticket × frequência.
2. Cruze com o top-down só para sanity check.
3. Documente cada premissa — diligência adora premissa rastreável.

Números defensáveis fecham rodada. Números inflados travam diligência.
$md$,
  'Frameworks',
  12,
  'publicado',
  now() - interval '2 days'
),
(
  'aquisicao-venture-pronta-vs-zero',
  'Aquisição de venture pronta vs. construir do zero: o cálculo do tempo',
  'Por que comprar uma operação validada pode comprimir 18 meses de execução em uma transação.',
  $md$
Construir do zero tem um custo que raramente entra na planilha: **tempo**.

## O que você compra quando adquire uma venture pronta

- Produto já validado em mercado.
- Time que conhece a operação.
- Métricas reais (não projeções).

Isso comprime a curva de aprendizado. Em vez de 18 meses descobrindo o que
funciona, você parte de uma base que já funciona.

## Quando faz sentido construir

Construir do zero ainda vence quando a sua tese é **fundamentalmente nova** e não
existe operação comparável para adquirir. Aí o tempo extra é o preço da
originalidade.
$md$,
  'M&A',
  8,
  'publicado',
  now() - interval '5 days'
)
on conflict (slug) do nothing;
