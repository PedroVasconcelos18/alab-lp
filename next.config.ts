import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite carregar avatares do Google (login) e capas hospedadas no Supabase Storage.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  // A landing page é HTML/CSS estático em public/index.html — não passa pelo
  // React. Sem este rewrite, "/" cairia no 404 do App Router, porque não existe
  // mais app/page.tsx. O resto do site (/blog, /admin, /entrar) segue no Next.
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
};

export default nextConfig;
