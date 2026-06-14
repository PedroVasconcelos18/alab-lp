import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const titulo = "A.lab — Venture Builder | Tech Solutions";
const descricao =
  "A.lab é uma venture builder que constrói, valida e entrega startups prontas para operar. Da tese ao seed, do código ao caixa.";

export const metadata: Metadata = {
  // Base para resolver URLs relativas (imagens OG, etc.) em produção.
  metadataBase: new URL(siteUrl),
  title: titulo,
  description: descricao,
  openGraph: {
    title: titulo,
    description: descricao,
    url: siteUrl,
    siteName: "A.lab",
    locale: "pt_BR",
    type: "website",
    // Imagem OG padrão do site (home, /blog e qualquer página sem OG próprio).
    images: [{ url: "/og", width: 1200, height: 630, alt: "A.lab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: titulo,
    description: descricao,
    images: ["/og"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
