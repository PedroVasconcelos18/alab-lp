import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Imagem Open Graph padrão do site (1200x630), no estilo dark/blueprint da
 * A.lab. Usada na home, /blog e qualquer página sem OG próprio.
 */
export function GET() {
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
        {/* linhas de blueprint */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            A.lab
            <span style={{ color: "#5A6478", fontWeight: 400 }}>&nbsp;/tech</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "20px",
              letterSpacing: "0.18em",
              color: "#5BB4FF",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            Venture Builder · Tech Solutions
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
              display: "flex",
            }}
          >
            Construímos startups do código ao caixa.
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
          alabventure.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
