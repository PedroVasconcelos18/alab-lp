/**
 * POST /api/contato — o formulário da página de contato.
 *
 * O site é estático; esta é a única função do repositório. Ela existe porque
 * formulário sem servidor ou depende de um terceiro guardando os leads, ou não
 * envia. O e-mail sai pelo Resend, que já é o transporte do blog — mesma chave,
 * mesmo remetente verificado, nenhum domínio novo para validar.
 *
 * `reply_to` é o e-mail de quem escreveu: responder no cliente de e-mail
 * responde para a pessoa, não para o remetente automático.
 *
 * Variáveis de ambiente (Vercel → Settings → Environment Variables):
 *   ALAB_RESEND_CHAVE      obrigatória — a mesma chave do blog
 *   ALAB_EMAIL_REMETENTE   opcional — padrão nao-responda@alabventure.com
 *   ALAB_CONTATO_DESTINO   opcional — padrão contato@alabventure.com
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const REMETENTE_PADRAO = 'nao-responda@alabventure.com';
const DESTINO_PADRAO = 'contato@alabventure.com';

// Curto de propósito: indisponibilidade do Resend vira erro rápido e visível,
// não uma requisição pendurada. É a mesma lição do mu-plugin do WordPress.
const TIMEOUT_MS = 15000;

// Tempo mínimo entre carregar a página e enviar. Gente lê e digita; robô posta
// no mesmo instante. Medido no cliente, então imune a relógio desalinhado.
//
// Ao contrário da isca, este corte ERRA em gente de verdade: autofill mais um
// clique rápido cabem em dois segundos. Por isso ele devolve 400 recuperável e
// não um 200 mudo — um lead perdido em silêncio custa muito mais do que contar
// a um robô que existe um cronômetro aqui.
const PREENCHIMENTO_MINIMO_MS = 2000;

const LIMITES = {
  nome: [2, 120],
  email: [5, 200],
  empresa: [0, 160],
  interesse: [0, 120],
  mensagem: [10, 5000],
};

const texto = (v) => (typeof v === 'string' ? v.trim() : '');

const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && !/[\r\n]/.test(v);

const escapar = (v) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function validar(corpo) {
  const campos = {
    nome: texto(corpo.nome),
    email: texto(corpo.email),
    empresa: texto(corpo.empresa),
    interesse: texto(corpo.interesse),
    mensagem: texto(corpo.mensagem),
  };

  for (const [campo, valor] of Object.entries(campos)) {
    const [min, max] = LIMITES[campo];
    if (valor.length === 0 && min > 0) return { erro: `O campo "${campo}" é obrigatório.` };
    if (valor.length < min) {
      return { erro: `O campo "${campo}" precisa de pelo menos ${min} caracteres.` };
    }
    if (valor.length > max) return { erro: `O campo "${campo}" passou de ${max} caracteres.` };
  }
  if (!emailValido(campos.email)) return { erro: 'Confira o e-mail informado.' };
  if (corpo.consentimento !== true && corpo.consentimento !== 'on') {
    return { erro: 'É preciso autorizar o tratamento dos dados para enviar.' };
  }
  return { campos };
}

function montarEmail(campos, origem) {
  const linhas = [
    ['Nome', campos.nome],
    ['E-mail', campos.email],
    ['Empresa', campos.empresa || '—'],
    ['Interesse', campos.interesse || '—'],
  ];

  const textoSimples =
    linhas.map(([r, v]) => `${r}: ${v}`).join('\n') +
    `\n\nMensagem:\n${campos.mensagem}\n\n—\nEnviado pelo formulário de ${origem}`;

  const html =
    '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.6;color:#111">' +
    '<h2 style="font-size:17px;margin:0 0 16px">Novo contato pelo site</h2>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">' +
    linhas
      .map(
        ([r, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${r}</td>` +
          `<td style="padding:4px 0"><strong>${escapar(v)}</strong></td></tr>`
      )
      .join('') +
    '</table>' +
    `<div style="white-space:pre-wrap;border-left:3px solid #5BB4FF;padding-left:14px">${escapar(
      campos.mensagem
    )}</div>` +
    `<p style="margin-top:24px;color:#888;font-size:13px">Enviado pelo formulário de ${escapar(
      origem
    )}</p></div>`;

  return { textoSimples, html };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erro: 'Método não permitido.' });
  }

  const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // A isca é invisível na tela: humano nenhum preenche, então falso positivo é
  // impossível e o 200 mudo é seguro. Dizer ao robô que a armadilha funcionou é
  // ensinar a próxima tentativa a desviar dela.
  if (texto(corpo.botcheck) !== '' || corpo.botcheck === true) {
    return res.status(200).json({ ok: true });
  }

  // O cronômetro, esse, pede para tentar de novo — e um humano consegue.
  if (Number.isFinite(corpo.duracao_ms) && corpo.duracao_ms < PREENCHIMENTO_MINIMO_MS) {
    return res.status(400).json({ ok: false, erro: 'Envio rápido demais. Clique em enviar outra vez.' });
  }

  const { erro, campos } = validar(corpo);
  if (erro) return res.status(400).json({ ok: false, erro });

  const chave = process.env.ALAB_RESEND_CHAVE;
  if (!chave) {
    // Sem chave não há envio. Falhar alto é a única opção honesta: um 200 aqui
    // faria o site dizer "recebemos" para um lead que ninguém vai ler.
    console.error('[contato] ALAB_RESEND_CHAVE não configurada — envio abortado');
    return res.status(503).json({ ok: false, erro: 'indisponivel' });
  }

  const origem = texto(corpo.origem) || 'www.alabventure.com/contato';
  const { textoSimples, html } = montarEmail(campos, origem);

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      signal: controle.signal,
      headers: {
        Authorization: `Bearer ${chave}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `A.lab <${process.env.ALAB_EMAIL_REMETENTE || REMETENTE_PADRAO}>`,
        to: [process.env.ALAB_CONTATO_DESTINO || DESTINO_PADRAO],
        reply_to: campos.email,
        subject: `Contato pelo site — ${campos.nome}${campos.empresa ? ` (${campos.empresa})` : ''}`,
        text: textoSimples,
        html,
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error('[contato] Resend respondeu', resposta.status, detalhe);
      return res.status(502).json({ ok: false, erro: 'indisponivel' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[contato] falha ao chamar o Resend:', e.name, e.message);
    return res.status(502).json({ ok: false, erro: 'indisponivel' });
  } finally {
    clearTimeout(relogio);
  }
};
