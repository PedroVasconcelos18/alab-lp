import NavLinks from "@/components/NavLinks";

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="/" className="brand" aria-label="A.lab home">
          <svg className="brand-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="bm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F1F4F9" />
                <stop offset="55%" stopColor="#9FA9BC" />
                <stop offset="100%" stopColor="#C4CDD9" />
              </linearGradient>
            </defs>
            <path d="M24 4 L44 44 L4 44 Z" stroke="url(#bm)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
            <path d="M24 18 c-2 0 -4 2 -4 5 v6 l-3 3 v3 h14 v-3 l-3 -3 v-6 c0 -3 -2 -5 -4 -5 z" fill="url(#bm)" />
            <circle cx="24" cy="22" r="1.6" fill="#0A0F1C" />
          </svg>
          <div className="brand-text">A.lab<span> /tech</span></div>
        </a>

        <NavLinks />
      </div>
    </header>
  );
}
