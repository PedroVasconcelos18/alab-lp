import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Method from "@/components/Method";
import Modes from "@/components/Modes";
import Portfolio from "@/components/Portfolio";
import Diferenciais from "@/components/Diferenciais";
import Conteudo from "@/components/Conteudo";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import RevealEffects from "@/components/RevealEffects";

// ISR: a LP é estática, mas a seção "Conteúdo" lê os posts publicados.
// Revalida a cada 60s para refletir novas publicações sem virar dinâmica.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <Method />
      <Modes />
      <Portfolio />
      <Diferenciais />
      <Conteudo />
      <Cta />
      <Footer />
      <RevealEffects />
    </>
  );
}
