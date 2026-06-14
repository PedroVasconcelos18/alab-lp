export default function Cta() {
  return (
    <section className="cta" id="contato">
      <div className="container">
        <div className="cta-inner">
          <div className="cta-readout cta-readout-tl">SYS · A-LAB / CONTACT</div>
          <div className="cta-readout cta-readout-tr">● ONLINE</div>
          <div className="cta-readout cta-readout-bl">23.5505° S · 46.6333° W</div>
          <div className="cta-readout cta-readout-br">VENTURE BUILDER</div>

          <svg className="cta-rocket" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="cr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F1F4F9" />
                <stop offset="100%" stopColor="#9FA9BC" />
              </linearGradient>
            </defs>
            <path d="M32 8 L56 56 L8 56 Z" stroke="url(#cr)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            <path d="M32 22 c-3 0 -5 3 -5 6 v9 l-3 3 v4 h16 v-4 l-3 -3 v-9 c0 -3 -2 -6 -5 -6 z" fill="url(#cr)" />
            <circle cx="32" cy="29" r="1.5" fill="#0A0F1C" />
          </svg>

          <h2 className="silver-text">Pronto para decolar<br />com uma venture A.lab?</h2>
          <p>Conte sobre seu interesse: empreender com uma operação pronta ou adquirir uma startup que tenha sinergias com o seu negócio. A gente responde em até 48h úteis.</p>

          <div className="cta-actions">
            <a href="mailto:contato@alabventure.com" className="btn btn-primary">
              contato@alabventure.com
              <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href="#" className="btn btn-ghost">
              Agendar reunião
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
