export default function Portfolio() {
  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow eyebrow-dot">Portfólio · Disponíveis</span>
          <div>
            <h2 className="section-title silver-text">Ventures construídas.<br /><em>Prontas para um novo dono.</em></h2>
            <p className="section-desc" style={{ marginTop: "24px" }}>Empresas que passaram pela metodologia A.lab e estão disponíveis para aquisição em diferentes estágios. Solicite o dossiê completo de qualquer venture.</p>
          </div>
        </div>

        {/* Featured: Clama */}
        <article className="venture-hero reveal">
          <div className="vh-visual" aria-hidden="true">
            <div className="vh-readout vh-readout-tl">VB-002 · CLAMA</div>
            <div className="vh-readout vh-readout-tr">LIVE · clama.me</div>
            <div className="vh-readout vh-readout-bl">FAITH · CONSUMER · BR</div>
            <div className="vh-readout vh-readout-br">JR 33:3</div>

            <svg className="vh-clama-art" viewBox="0 0 320 360" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="clamaGlow" cx="50%" cy="100%" r="60%">
                  <stop offset="0%" stopColor="#F2C754" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="clamaArc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2C754" stopOpacity="0" />
                  <stop offset="100%" stopColor="#F2C754" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="clamaText" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBE9A0" />
                  <stop offset="55%" stopColor="#F2C754" />
                  <stop offset="100%" stopColor="#D4A017" />
                </linearGradient>
                <linearGradient id="clamaBeam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2C754" stopOpacity="0" />
                  <stop offset="50%" stopColor="#F2C754" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F2C754" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* emanating glow */}
              <ellipse cx="160" cy="330" rx="170" ry="90" fill="url(#clamaGlow)" />

              {/* vertical beam */}
              <line x1="160" y1="320" x2="160" y2="50" stroke="url(#clamaBeam)" strokeWidth="1" />

              {/* concentric arcs rising */}
              <path d="M 20 320 A 140 140 0 0 1 300 320" stroke="url(#clamaArc)" strokeWidth="1" fill="none" strokeDasharray="3 5" />
              <path d="M 50 320 A 110 110 0 0 1 270 320" stroke="url(#clamaArc)" strokeWidth="1" fill="none" strokeDasharray="3 5" opacity="0.75" />
              <path d="M 80 320 A 80 80 0 0 1 240 320" stroke="url(#clamaArc)" strokeWidth="1" fill="none" strokeDasharray="3 5" opacity="0.55" />
              <path d="M 110 320 A 50 50 0 0 1 210 320" stroke="url(#clamaArc)" strokeWidth="1" fill="none" opacity="0.4" />

              {/* origin point */}
              <circle cx="160" cy="320" r="14" stroke="#F2C754" strokeWidth="0.8" fill="none" opacity="0.3" />
              <circle cx="160" cy="320" r="6" fill="#F2C754" />

              {/* top apex */}
              <circle cx="160" cy="50" r="3" fill="#F2C754" />
              <circle cx="160" cy="50" r="8" stroke="#F2C754" strokeWidth="0.6" fill="none" opacity="0.4" />

              {/* wordmark */}
              <text x="160" y="195" fontFamily="Bricolage Grotesque, serif" fontSize="56" fill="url(#clamaText)" textAnchor="middle" fontWeight="700" letterSpacing="-3">clama</text>
              <text x="160" y="222" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#F2C754" textAnchor="middle" letterSpacing="3" opacity="0.7">.ME</text>
            </svg>
          </div>

          <div className="vh-content">
            <span className="v-status">Disponível para aquisição</span>

            <div className="v-meta">
              <span>VB / 002</span>
              <span className="sep"></span>
              <span>Faith · Consumer Tech</span>
              <span className="sep"></span>
              <span>T-00 · Liftoff</span>
            </div>

            <h3>Clama</h3>
            <p className="vh-tag">"O clamor que nasce do coração do povo."</p>
            <p>Plataforma de oração personalizada e intercessão digital. O usuário envia seu pedido e recebe uma resposta espiritual contextualizada, com versículos bíblicos, em qualquer lugar e a qualquer momento. Endereça o mercado evangélico brasileiro — um dos maiores e mais engajados do mundo — com produto vivo, base de usuários crescente e operação em curso.</p>

            <div className="chips">
              <span className="chip">Mercado evangélico BR</span>
              <span className="chip">Consumer · D2C</span>
              <span className="chip">Produto em produção</span>
              <span className="chip">Tração orgânica</span>
            </div>

            <div className="v-actions">
              <a href="https://clama.me" target="_blank" rel="noopener" className="btn btn-primary">
                Visitar clama.me
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 3h7v7M13 3L4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#contato" className="btn btn-ghost">
                Solicitar dossiê completo
              </a>
            </div>
          </div>
        </article>

        {/* Pipeline grid */}
        <div className="venture-grid">

          {/* Venture 03 */}
          <article className="venture reveal">
            <div className="venture-cover">
              <span className="stealth-corner">VB / 003</span>
              <span className="stealth-corner-r" style={{ color: "#F2B33D" }}>● EM VALIDAÇÃO</span>
              <span className="stealth-mark">stealth</span>
              <span className="stealth-bottom">
                <span>FINTECH · B2B</span>
                <span>T-02</span>
              </span>
            </div>
            <div className="venture-body">
              <span className="v-status amber">Em validação · Stealth</span>
              <div className="v-meta">
                <span>FinTech B2B</span>
                <span className="sep"></span>
                <span>SaaS</span>
              </div>
              <h4>Solução financeira para PMEs brasileiras</h4>
              <p>Produto vertical que automatiza fluxos financeiros recorrentes em pequenas e médias empresas. Modelo de negócio em validação ativa com primeiros contratos pagos.</p>
              <div className="venture-foot">
                <span className="stage">Estágio · Pré-seed</span>
                <a href="#contato">
                  Solicitar acesso
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </div>
          </article>

          {/* Venture 04 */}
          <article className="venture reveal">
            <div className="venture-cover">
              <span className="stealth-corner">VB / 004</span>
              <span className="stealth-corner-r" style={{ color: "#5BB4FF" }}>● EM DESENVOLVIMENTO</span>
              <span className="stealth-mark">stealth</span>
              <span className="stealth-bottom">
                <span>HEALTHTECH</span>
                <span>T-03</span>
              </span>
            </div>
            <div className="venture-body">
              <span className="v-status silver">Em desenvolvimento</span>
              <div className="v-meta">
                <span>HealthTech</span>
                <span className="sep"></span>
                <span>D2C</span>
              </div>
              <h4>Plataforma de cuidado contínuo em saúde</h4>
              <p>Produto de saúde digital focado em adesão e jornada do paciente. MVP em desenvolvimento com parceria já estruturada para piloto de campo.</p>
              <div className="venture-foot">
                <span className="stage">Estágio · Pré-seed</span>
                <a href="#contato">
                  Solicitar acesso
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </div>
          </article>

          {/* Venture 05 */}
          <article className="venture reveal">
            <div className="venture-cover">
              <span className="stealth-corner">VB / 005</span>
              <span className="stealth-corner-r">● EM ESTUDO</span>
              <span className="stealth-mark">stealth</span>
              <span className="stealth-bottom">
                <span>LEGALTECH</span>
                <span>T-04</span>
              </span>
            </div>
            <div className="venture-body">
              <span className="v-status silver">Em estudo de mercado</span>
              <div className="v-meta">
                <span>LegalTech</span>
                <span className="sep"></span>
                <span>SaaS</span>
              </div>
              <h4>Automação jurídica para escritórios e departamentos</h4>
              <p>Tese em validação para um produto que reduz horas operacionais em rotinas jurídicas recorrentes. Estudo de mercado e definição de tese em curso.</p>
              <div className="venture-foot">
                <span className="stage">Estágio · Tese</span>
                <a href="#contato">
                  Solicitar acesso
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </div>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
