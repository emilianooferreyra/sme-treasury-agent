import { ImageResponse } from "next/og";

// The preview a shared link shows. It depends on no request data, so Next.js renders it once at
// build time and caches it. Satori supports flexbox only, and the default font keeps it light.
export const alt = "Cobrá en pesos. Recibilo en Celo. Un asistente de cobros para PyMEs argentinas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: 96,
        background: "#ffffff",
        color: "#171717",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: "#6b6b80" }}>Para PyMEs argentinas · Celo + Ripio</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 84, lineHeight: 1.05 }}>
        <span>Cobrá en pesos.</span>
        <span style={{ color: "#6b6b80" }}>Recibilo en Celo.</span>
      </div>
      <div style={{ display: "flex", fontSize: 34, color: "#3f3f50" }}>
        Un asistente que crea tus cobros y te avisa cuando te pagaron.
      </div>
    </div>,
    size,
  );
}
