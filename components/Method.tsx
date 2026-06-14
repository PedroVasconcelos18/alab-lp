export default function Method() {
  return (
    <section className="method" id="metodologia">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow-dot">Protocolo de lançamento</span>
          <div>
            <h2 className="section-title silver-text">Quatro fases.<br />Uma empresa <em>pronta para operar.</em></h2>
            <p className="section-desc" style={{ marginTop: "24px" }}>A nossa metodologia traduz uma tese em um produto de mercado, com modelo de negócio validado e operação em curso. Sem deck. Sem promessa. Empresa funcional.</p>
          </div>
        </div>

        <div className="method-track">
          <div className="method-line"></div>

          <div className="phases">
            {/* Phase 01 */}
            <div className="phase reveal">
              <div className="phase-marker">
                <span className="phase-tcode">T-04</span>
                <span className="phase-num">FASE 01</span>
              </div>
              <div className="phase-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 12h4l3-7 4 14 3-7h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Estudo de mercado<br />& potencial de escala</h3>
              <p>Mapeamento profundo da oportunidade, do TAM real, dos players e da janela de entrada. Construímos a tese antes de construir a empresa.</p>
              <ul className="phase-list">
                <li>Pesquisa primária e desk research</li>
                <li>Análise competitiva</li>
                <li>Sizing TAM · SAM · SOM</li>
                <li>Tese de investimento</li>
              </ul>
            </div>

            {/* Phase 02 */}
            <div className="phase reveal">
              <div className="phase-marker">
                <span className="phase-tcode">T-03</span>
                <span className="phase-num">FASE 02</span>
              </div>
              <div className="phase-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Desenvolvimento<br />de produto</h3>
              <p>Squad multidisciplinar coloca o MVP no ar com arquitetura escalável, pronto para sustentar tração. Engenharia, design e produto integrados.</p>
              <ul className="phase-list">
                <li>Arquitetura técnica</li>
                <li>UX e UI de alto padrão</li>
                <li>MVP em produção</li>
                <li>Stack moderno e escalável</li>
              </ul>
            </div>

            {/* Phase 03 */}
            <div className="phase reveal">
              <div className="phase-marker">
                <span className="phase-tcode">T-02</span>
                <span className="phase-num">FASE 03</span>
              </div>
              <div className="phase-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h3>Validação do<br />modelo de negócio</h3>
              <p>Testes reais com clientes reais. Definimos pricing, canais de aquisição e unit economics que sustentam o crescimento. Métrica é o nosso oxigênio.</p>
              <ul className="phase-list">
                <li>Aquisição paga e orgânica</li>
                <li>Pricing e ICP definidos</li>
                <li>CAC · LTV · payback</li>
                <li>Primeiros contratos pagos</li>
              </ul>
            </div>

            {/* Phase 04 */}
            <div className="phase reveal">
              <div className="phase-marker">
                <span className="phase-tcode">T-01</span>
                <span className="phase-num">FASE 04</span>
              </div>
              <div className="phase-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Início da operação<br />& handover</h3>
              <p>Empresa em operação, com receita rodando, processos documentados e equipe estruturada. O comprador assume um negócio vivo, não um projeto.</p>
              <ul className="phase-list">
                <li>Operação em curso</li>
                <li>Stack jurídico e fiscal</li>
                <li>Playbooks e SOPs</li>
                <li>Transferência assistida</li>
              </ul>
            </div>
          </div>

          <div className="liftoff-banner reveal">
            <span className="lo-tag">T-00 · LIFTOFF</span>
            <p className="lo-text">Após as quatro fases, a startup está pronta para ser vendida e ter sua gestão assumida pelo comprador.</p>
            <a href="#modalidades" className="btn btn-ghost">
              Ver modalidades
              <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
