import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite carregar avatares do Google (login) e capas hospedadas no Supabase Storage.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
