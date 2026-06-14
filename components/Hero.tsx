export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <span className="hero-tag">
              <span className="badge">●</span>
              VENTURE BUILDER · TECH SOLUTIONS
            </span>

            <h1 className="silver-text reveal">
              Construímos startups<br />
              <em>do código ao caixa.</em>
            </h1>

            <p className="hero-lead reveal">
              A.lab é uma venture builder que estrutura, valida e entrega negócios prontos para operar — até o estágio seed ou pré-seed. Você compra uma empresa funcional, não uma apresentação.
            </p>

            <div className="hero-actions reveal">
              <a href="#contato" className="btn btn-primary">
                Quero adquirir uma venture
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#metodologia" className="btn btn-ghost">
                Ver metodologia
              </a>
            </div>
          </div>

          {/* Hero blueprint visual */}
          <div className="hero-visual reveal" aria-hidden="true">
            <div className="hv-readout hv-readout-tl">SYS · A-LAB / VB-001</div>
            <div className="hv-readout hv-readout-tr">SIGNAL LIVE</div>

            <svg className="hv-trajectory" viewBox="0 0 500 525" preserveAspectRatio="none">
              <defs>
                <linearGradient id="traj" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5BB4FF" stopOpacity="0" />
                  <stop offset="60%" stopColor="#5BB4FF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#5BB4FF" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* target rings */}
              <circle cx="420" cy="80" r="40" stroke="rgba(91,180,255,0.2)" fill="none" />
              <circle cx="420" cy="80" r="24" stroke="rgba(91,180,255,0.35)" fill="none" />
              <circle cx="420" cy="80" r="8" fill="#5BB4FF" />
              {/* trajectory */}
              <path d="M 60 480 Q 250 480 280 320 T 420 80"
                    stroke="url(#traj)" strokeWidth="1.5" fill="none"
                    strokeDasharray="4 4" />
              {/* coordinate marks */}
              <g stroke="rgba(196,205,217,0.3)" strokeWidth="1">
                <line x1="60" y1="475" x2="60" y2="485" />
                <line x1="55" y1="480" x2="65" y2="480" />
                <line x1="200" y1="395" x2="200" y2="405" />
                <line x1="195" y1="400" x2="205" y2="400" />
                <line x1="320" y1="225" x2="320" y2="235" />
                <line x1="315" y1="230" x2="325" y2="230" />
              </g>
              {/* micro labels */}
              <g fontFamily="JetBrains Mono" fontSize="9" fill="#5A6478" letterSpacing="1">
                <text x="68" y="475">T-04 · TESE</text>
                <text x="208" y="395">T-03 · BUILD</text>
                <text x="328" y="225">T-02 · VALIDAÇÃO</text>
                <text x="365" y="55">T-00 · LIFTOFF</text>
              </g>
            </svg>

            <div className="hv-rocket-wrap">
              <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="rocketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1F4F9" />
                    <stop offset="50%" stopColor="#9FA9BC" />
                    <stop offset="100%" stopColor="#C4CDD9" />
                  </linearGradient>
                  <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5BB4FF" />
                    <stop offset="60%" stopColor="#5BB4FF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#5BB4FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* A frame */}
                <path d="M100 20 L180 200 L20 200 Z" stroke="url(#rocketGrad)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <path d="M100 20 L180 200 L20 200 Z" stroke="url(#rocketGrad)" strokeWidth="0.5" fill="none" opacity="0.4" transform="translate(2,2)" />
                {/* Rocket body */}
                <path d="M100 70 c-9 0 -16 8 -16 18 v28 l-10 12 v14 h52 v-14 l-10 -12 v-28 c0 -10 -7 -18 -16 -18 z" fill="url(#rocketGrad)" />
                <circle cx="100" cy="92" r="4.5" fill="#0A0F1C" />
                <circle cx="100" cy="92" r="2" fill="#5BB4FF" />
                {/* Flame */}
                <path d="M85 142 q15 24 30 0 q-5 14 -15 16 q-10 -2 -15 -16 z" fill="url(#flameGrad)" />
                {/* Crossbar of A */}
                <path d="M50 158 H150" stroke="url(#rocketGrad)" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="hv-readout hv-readout-bl">
              <span>STAGE</span><b>4 / 4</b>
              <span>STATUS</span><b style={{ color: "#6FE3B6" }}>VALIDATED</b>
              <span>TICKET</span><b>SEED · PRE-SEED</b>
            </div>
            <div className="hv-readout hv-readout-br">23.5505° S · 46.6333° W</div>
          </div>
        </div>

        <div className="stats-strip">
          <div className="stat">
            <div className="num">04<span>.</span></div>
            <div className="lbl">Ventures no portfólio</div>
          </div>
          <div className="stat">
            <div className="num">01<span>.</span></div>
            <div className="lbl">Disponível para aquisição</div>
          </div>
          <div className="stat">
            <div className="num">02<span>.</span></div>
            <div className="lbl">Modalidades de aquisição</div>
          </div>
          <div className="stat">
            <div className="num">PRE<span>-SEED</span></div>
            <div className="lbl">Ao seed estruturado</div>
          </div>
        </div>
      </div>
    </section>
  );
}
