import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const AXIS_LABELS: Record<string, string> = {
  f: "集中力",
  e: "人体工学",
  p: "生産性",
  a: "審美性",
  m: "習慣",
};

const RANK_DATA: Record<
  string,
  { label: string; tagline: string; from: string; to: string }
> = {
  S: {
    label: "伝説のデスク",
    tagline: "この環境に、死角はない。",
    from: "#b8860b",
    to: "#ffd700",
  },
  A: {
    label: "プロのデスク",
    tagline: "あと一歩で、伝説になる。",
    from: "#059669",
    to: "#34d399",
  },
  B: {
    label: "上級者のデスク",
    tagline: "悪くない。だが、まだ上がある。",
    from: "#2563eb",
    to: "#60a5fa",
  },
  C: {
    label: "発展途上のデスク",
    tagline: "可能性はある。あとは行動だけだ。",
    from: "#d97706",
    to: "#fbbf24",
  },
  D: {
    label: "改革が必要なデスク",
    tagline: "今日が、変わる日だ。",
    from: "#dc2626",
    to: "#f87171",
  },
};

function getRankFromScore(score: number): string {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

// desk-bg.jpg is served from /public and fetched via full URL in edge runtime

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const score = parseInt(searchParams.get("s") || "0", 10);
  const rankParam = searchParams.get("r");
  const rank =
    rankParam && RANK_DATA[rankParam.toUpperCase()]
      ? rankParam.toUpperCase()
      : getRankFromScore(score);
  const data = RANK_DATA[rank] || RANK_DATA.D;

  const axes = {
    f: parseInt(searchParams.get("f") || "0", 10),
    e: parseInt(searchParams.get("e") || "0", 10),
    p: parseInt(searchParams.get("p") || "0", 10),
    a: parseInt(searchParams.get("a") || "0", 10),
    m: parseInt(searchParams.get("m") || "0", 10),
  };

  // Fetch desk background image from public folder
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const deskImageUrl = `${protocol}://${host}/desk-bg.jpg`;
  let deskImageSrc = "";
  try {
    const res = await fetch(deskImageUrl);
    const buf = await res.arrayBuffer();
    const uint8 = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
    deskImageSrc = `data:image/jpeg;base64,${btoa(binary)}`;
  } catch {
    // fallback: no image
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#f5f5f5",
          fontFamily: "sans-serif",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Desk background image */}
        {deskImageSrc && (
          <img
            src={deskImageSrc}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        )}
        {/* White overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(245,245,245,0.88)",
            display: "flex",
          }}
        />
        {/* Left: Rank Card */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "32px",
            padding: "48px 56px",
            background: `linear-gradient(135deg, ${data.from}, ${data.to})`,
            position: "relative",
            overflow: "hidden",
            flex: "0 0 460px",
            height: "100%",
          }}
        >
          {/* Background rank letter */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-20px",
              fontSize: "360px",
              fontWeight: 900,
              color: "rgba(255,255,255,0.1)",
              lineHeight: 1,
              display: "flex",
            }}
          >
            {rank}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "4px",
                textTransform: "uppercase" as const,
                marginBottom: "20px",
              }}
            >
              Desk Environment Score
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "140px",
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-6px",
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: "28px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "16px",
                }}
              >
                /100
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255,255,255,0.18)",
                borderRadius: "999px",
                padding: "8px 20px",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#ffffff",
                }}
              >
                {rank}ランク
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                —
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {data.label}
              </span>
            </div>

            <span
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.65)",
                fontStyle: "italic",
              }}
            >
              「{data.tagline}」
            </span>
          </div>
        </div>

        {/* Right: Axis + Branding */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            height: "100%",
          }}
        >
          {/* Brand */}
          <span
            style={{
              fontSize: "18px",
              fontWeight: 900,
              color: "#171717",
              letterSpacing: "-0.5px",
            }}
          >
            DESK AI
          </span>

          {/* Axis bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #e5e5e5",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#a3a3a3",
                letterSpacing: "3px",
                textTransform: "uppercase" as const,
                marginBottom: "4px",
              }}
            >
              Axis Breakdown
            </span>
            {Object.entries(axes).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#737373",
                    width: "52px",
                    textAlign: "right" as const,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {AXIS_LABELS[key]}
                </span>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: "8px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(value / 20) * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${data.from}, ${data.to})`,
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#171717",
                    width: "28px",
                    textAlign: "right" as const,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <span
            style={{
              fontSize: "14px",
              color: "#a3a3a3",
            }}
          >
            あなたのデスクは何ランク？ → desk-ai.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
