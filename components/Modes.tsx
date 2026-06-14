export default function Modes() {
  return (
    <section className="modes" id="modalidades">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Modalidades de aquisição</span>
          <div>
            <h2 className="section-title silver-text">Compre a empresa.<br /><em>Escolha como pilotar.</em></h2>
            <p className="section-desc" style={{ marginTop: "24px" }}>Duas modalidades projetadas para empreendedores que querem operar e empresas que enxergam sinergia. Você escolhe o nível de envolvimento da A.lab depois do handover.</p>
          </div>
        </div>

        <div className="mode-grid">
          {/* Modalidade 01 */}
          <article className="mode-card reveal">
            <div className="mode-tag"><span className="num">01</span>STANDALONE</div>
            <h3 className="silver-text">Aquisição completa<br />com equipe própria</h3>
            <p className="mode-sub">Você assume 100% da gestão e estrutura sua própria equipe para tocar o negócio. Liberdade total para imprimir sua visão.</p>

            <ul className="mode-features">
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Transferência completa de propriedade intelectual e operacional
              </li>
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Documentação técnica, processos e playbooks
              </li>
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Período de handover assistido com o time A.lab
              </li>
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Autonomia total sobre roadmap, time e cultura
              </li>
            </ul>

            <div className="mode-foot">
              <div className="ideal">
                Ideal para
                <b>empreendedores de carreira e operadores experientes</b>
              </div>
              <a href="#contato" className="btn btn-ghost">
                Conversar
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </article>

          {/* Modalidade 02 */}
          <article className="mode-card featured reveal">
            <div className="mode-tag"><span className="num">02</span>POWERED BY A.LAB</div>
            <h3 className="silver-text">Aquisição com<br />condução tática A.lab</h3>
            <p className="mode-sub">Você assume a gestão estratégica e nos contrata para a execução tática e os próximos passos do produto. Velocidade sem montar time do zero.</p>

            <ul className="mode-features">
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Squad A.lab seguindo executando produto e engenharia
              </li>
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Roadmap conjunto com as prioridades do comprador
              </li>
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Transição gradual ou continuidade por contrato
              </li>
              <li>
                <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Aceleração imediata sem ramp-up de equipe
              </li>
            </ul>

            <div className="mode-foot">
              <div className="ideal">
                Ideal para
                <b>empresas com sinergias estratégicas e investidores corporativos</b>
              </div>
              <a href="#contato" className="btn btn-primary">
                Conversar
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
