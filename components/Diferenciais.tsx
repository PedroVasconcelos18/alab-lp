export default function Diferenciais() {
  return (
    <section id="diferenciais">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Por que A.lab</span>
          <div>
            <h2 className="section-title silver-text">A diferença entre <em>uma ideia</em><br />e uma empresa pronta.</h2>
          </div>
        </div>

        <div className="why-grid">
          <div className="why-card reveal">
            <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 2 L22 12 L12 22 L2 12 Z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <div className="why-num">/ 01</div>
            <h3>Tese antes de tela</h3>
            <p>Não construímos por intuição. Toda venture nasce de um estudo de mercado profundo e de uma janela de oportunidade real e mensurável.</p>
          </div>

          <div className="why-card reveal">
            <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M3 17l6-6 4 4 8-8M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="why-num">/ 02</div>
            <h3>Métrica como bússola</h3>
            <p>Validação de modelo com unit economics reais. CAC, LTV, payback e contratos pagos antes de entregar. Você compra evidência, não esperança.</p>
          </div>

          <div className="why-card reveal">
            <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <path d="M3 10h18M8 6V3M16 6V3" strokeLinecap="round" />
            </svg>
            <div className="why-num">/ 03</div>
            <h3>Empresa, não projeto</h3>
            <p>O que entregamos roda. Receita, equipe, processos, infra fiscal, jurídica e operacional. A primeira reunião do comprador é com clientes pagantes.</p>
          </div>

          <div className="why-card reveal">
            <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18" strokeLinecap="round" />
            </svg>
            <div className="why-num">/ 04</div>
            <h3>Mercado tech brasileiro</h3>
            <p>Conhecemos o jogo local: regulação, ticket médio, ciclos de venda B2B e a malha de capital seed e pré-seed do Brasil.</p>
          </div>

          <div className="why-card reveal">
            <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <div className="why-num">/ 05</div>
            <h3>Handover assistido</h3>
            <p>A passagem de bastão é desenhada como um processo: documentação, treinamento e ramp-up estruturado para garantir continuidade.</p>
          </div>

          <div className="why-card reveal">
            <svg className="why-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
            </svg>
            <div className="why-num">/ 06</div>
            <h3>Modalidades flexíveis</h3>
            <p>Standalone ou Powered by A.lab. Você decide o nível de envolvimento que faz sentido para sua tese de aquisição e momento da empresa.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
