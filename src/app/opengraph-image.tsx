import { ImageResponse } from "next/og";

export const alt = "Finference — Your AI product should make money";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "68px 78px",
        color: "#f5f7f4",
        background:
          "radial-gradient(circle at 25% 10%, #1a2512 0%, #080b0d 38%, #07090c 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            color: "#c9ff3f",
            border: "1px solid rgba(201,255,63,.35)",
          }}
        >
          ×
        </div>
        finference
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            maxWidth: 1000,
            fontSize: 88,
            lineHeight: 0.95,
            letterSpacing: "-5px",
            fontWeight: 600,
          }}
        >
          Your AI product should{" "}
          <span style={{ color: "#c9ff3f" }}>make money.</span>
        </div>
        <div
          style={{
            marginTop: 34,
            maxWidth: 850,
            fontSize: 25,
            lineHeight: 1.4,
            color: "rgba(255,255,255,.55)",
          }}
        >
          Observe, optimize, govern, and bill every inference from one auditable
          margin control plane.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 18,
          color: "rgba(255,255,255,.35)",
        }}
      >
        <span>Galuxium Nexus V2 · 2026</span>
        <span style={{ color: "#c9ff3f" }}>Live interactive demo →</span>
      </div>
    </div>,
    size,
  );
}
