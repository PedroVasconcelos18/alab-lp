import { ImageResponse } from "next/og";
import { createStaticClient } from "@/lib/supabase/static";

export const runtime = "edge";
export const alt = "A.lab — Conteúdo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagem Open Graph dinâmica por post: o título do post sobre o fundo
 * dark/blueprint da A.lab. Gera um card único pra cada post no WhatsApp/LinkedIn.
 * Resolve também o fallback — todo post tem imagem, mesmo sem capa_url.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createStaticClient();
  const { data } = await supabase
    .from("posts")
    .select("titulo, categoria, tempo_leitura")
    .eq("slug", slug)
    .eq("status", "publicado")
    .single();

  const titulo = (data?.titulo as string) ?? "Conteúdo A.lab";
  const categoria = (data?.categoria as string) ?? "";
  const tempo = (data?.tempo_leitura as number) ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, #11203a, #0A0F1C 70%)",
          padding: "72px",
          fontFamily: "sans-serif",
          color: "#F1F4F9",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(91,180,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(91,180,255,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          A.lab
          <span style={{ color: "#5A6478", fontWeight: 400 }}>&nbsp;/tech</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {(categoria || tempo) && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "20px",
                letterSpacing: "0.12em",
                color: "#5BB4FF",
                textTransform: "uppercase",
                display: "flex",
                gap: "12px",
              }}
            >
              {categoria}
              {categoria && tempo ? " · " : ""}
              {tempo ? `${tempo} min` : ""}
            </div>
          )}
          <div
            style={{
              fontSize: "60px",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              maxWidth: "1020px",
              display: "flex",
            }}
          >
            {titulo}
          </div>
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: "18px",
            color: "#8B95A8",
            display: "flex",
          }}
        >
          alabventure.com/blog
        </div>
      </div>
    ),
    size,
  );
}
