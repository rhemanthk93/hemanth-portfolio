import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "askhemanth — Engineer building with agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0908",
          color: "#f5f1eb",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
          backgroundImage:
            "linear-gradient(to right, rgba(245,241,235,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,241,235,0.05) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b6562",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <span>ask</span>
            <span style={{ color: "#e07856" }}>hemanth</span>
            <span>v0.1</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid #1f1c1a",
              background: "#11100e",
              borderRadius: 999,
              padding: "10px 18px",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#e07856",
              }}
            />
            <span>online</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6b6562",
            }}
          >
            Hemanth Kumar · Singapore
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>Engineer</div>
            <div>building with</div>
            <div style={{ color: "#e07856" }}>agents.</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b6562",
          }}
        >
          <span>askhemanth.com</span>
          <span>conversation-first portfolio</span>
        </div>
      </div>
    ),
    size
  );
}
