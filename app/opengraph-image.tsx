import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "askhemanth — Engineer building with agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Load the downscaled avatar from public/ at render time and inline as base64.
  // This keeps the OG endpoint self-contained — no runtime fetch to the
  // origin, works on first deploy before DNS is live.
  const avatarUrl = new URL(
    "../public/avatars/hemanth-laptop-og.png",
    import.meta.url
  );
  const avatarBuffer = await fetch(avatarUrl).then((r) => r.arrayBuffer());
  const avatarSrc = `data:image/png;base64,${Buffer.from(avatarBuffer).toString(
    "base64"
  )}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0908",
          color: "#f5f1eb",
          display: "flex",
          flexDirection: "row",
          fontFamily: "system-ui, sans-serif",
          backgroundImage:
            "linear-gradient(to right, rgba(245,241,235,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,241,235,0.05) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      >
        {/* Avatar column (~40%) */}
        <div
          style={{
            width: 480,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            alt=""
            width={477}
            height={640}
            style={{
              objectFit: "contain",
              objectPosition: "bottom center",
            }}
          />
        </div>

        {/* Text column (~60%) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px 60px 30px",
          }}
        >
          {/* Top: wordmark + online pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8a847f",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <span>ask</span>
              <span style={{ color: "#e07856" }}>hemanth</span>
              <span>v0.1</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid #1f1c1a",
                background: "#11100e",
                borderRadius: 999,
                padding: "8px 14px",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#e07856",
                }}
              />
              <span>online</span>
            </div>
          </div>

          {/* Middle: eyebrow + headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8a847f",
              }}
            >
              Hemanth Kumar · Singapore
            </div>
            <div
              style={{
                fontSize: 86,
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

          {/* Bottom: domain + tagline */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8a847f",
            }}
          >
            <span>askhemanth.com</span>
            <span>conversation-first portfolio</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
