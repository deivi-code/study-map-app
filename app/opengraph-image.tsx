import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#0f0f1a"
const PRIMARY = "#6b8cff"
const FOREGROUND = "#f5f5f7"
const MUTED = "#9ca3af"
const GREEN = "#6ee7b7"
const AMBER = "#fcd34d"
const RED = "#f87171"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107, 140, 255, 0.22), transparent)`,
          }}
        />

        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          style={{ marginBottom: 24, color: PRIMARY }}
        >
          <circle cx="12" cy="5" r="2.4" fill={PRIMARY} />
          <circle cx="5.5" cy="17" r="2.4" fill={PRIMARY} opacity="0.65" />
          <circle cx="18.5" cy="17" r="2.4" fill={PRIMARY} opacity="0.65" />
          <path
            d="M12 7.4 6.6 14.8M12 7.4l5.4 7.4"
            stroke={PRIMARY}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: FOREGROUND,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          Mapa de Estudio
        </h1>

        <p
          style={{
            fontSize: 24,
            color: MUTED,
            marginTop: 16,
            marginBottom: 40,
            textAlign: "center",
            maxWidth: 520,
            lineHeight: 1.4,
          }}
        >
          Convierte tus apuntes en conocimiento
        </p>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            { color: RED, label: "Por aprender" },
            { color: AMBER, label: "En progreso" },
            { color: GREEN, label: "Dominado" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                color: MUTED,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: s.color,
                }}
              />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
