"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const naHome = usePathname() === "/";
  const ancora = (id: string) => (naHome ? `#${id}` : `/#${id}`);

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <a href="/" className="brand" aria-label="A.lab home">
              <svg className="brand-mark" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="bm2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1F4F9" />
                    <stop offset="55%" stopColor="#9FA9BC" />
                    <stop offset="100%" stopColor="#C4CDD9" />
                  </linearGradient>
                </defs>
                <path d="M24 4 L44 44 L4 44 Z" stroke="url(#bm2)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
                <path d="M24 18 c-2 0 -4 2 -4 5 v6 l-3 3 v3 h14 v-3 l-3 -3 v-6 c0 -3 -2 -5 -4 -5 z" fill="url(#bm2)" />
                <circle cx="24" cy="22" r="1.6" fill="#0A0F1C" />
              </svg>
              <div className="brand-text">A.lab<span> /tech</span></div>
            </a>
            <p>Venture builder dedicada a construir, validar e entregar startups prontas para operar. Brasil. Tech. Solutions.</p>
          </div>

          <div className="footer-col">
            <h4>Empresa</h4>
            <ul>
              <li><a href={ancora("metodologia")}>Metodologia</a></li>
              <li><a href={ancora("modalidades")}>Modalidades</a></li>
              <li><a href={ancora("portfolio")}>Portfólio</a></li>
              <li><a href={ancora("diferenciais")}>Por que A.lab</a></li>
            </ul>
          </div>

          {/* Coluna "Conteúdo" oculta por enquanto — manter para reativar depois
          <div class="footer-col">
            <h4>Conteúdo</h4>
            <ul>
              <li><a href="#conteudo">Análises</a></li>
              <li><a href="#">Frameworks</a></li>
              <li><a href="#">Newsletter</a></li>
              <li><a href="#">Podcast</a></li>
            </ul>
          </div>
          */}

          <div className="footer-col">
            <h4>Contato</h4>
            <ul>
              <li><a href="mailto:contato@alabventure.com">contato@alabventure.com</a></li>
              {/* Links de contato ocultos por enquanto — manter para reativar depois
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Trabalhe conosco</a></li>
              */}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 A.lab Venture Builder · Todos os direitos reservados</div>
          <div className="footer-coords">
            <span>SYS · A-LAB / VB-001</span>
            <span>23.5505° S · 46.6333° W</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
