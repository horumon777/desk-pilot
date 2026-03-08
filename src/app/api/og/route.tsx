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

const DESK_TYPE_NAMES: Record<string, string> = {
  pragmatic: "質実剛健型",
  luxury: "ラグジュアリー型",
  minimalist: "ミニマリスト型",
  gadgetOtaku: "ガジェットオタク型",
  aspiring: "上昇志向型",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const score = parseInt(searchParams.get("s") || "0", 10);
  const type = searchParams.get("t") || "aspiring";
  const typeName = DESK_TYPE_NAMES[type] || "上昇志向型";

  const axes = {
    f: parseInt(searchParams.get("f") || "0", 10),
    e: parseInt(searchParams.get("e") || "0", 10),
    p: parseInt(searchParams.get("p") || "0", 10),
    a: parseInt(searchParams.get("a") || "0", 10),
    m: parseInt(searchParams.get("m") || "0", 10),
  };

  const scoreColor =
    score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#171717",
                letterSpacing: "-0.5px",
              }}
            >
              DESK AI
            </span>
          </div>
          <span
            style={{
              fontSize: "14px",
              color: "#a3a3a3",
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
            }}
          >
            Desk Environment Score
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "40px 48px",
            gap: "48px",
          }}
        >
          {/* Left: Score */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: "160px",
                fontWeight: 900,
                color: "#171717",
                lineHeight: 1,
                letterSpacing: "-8px",
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: "28px",
                color: "#a3a3a3",
                fontWeight: 500,
                marginTop: "-8px",
              }}
            >
              / 100
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "16px",
                padding: "8px 20px",
                borderRadius: "999px",
                backgroundColor: "#f5f5f5",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: scoreColor,
                }}
              />
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#171717",
                }}
              >
                {typeName}
              </span>
            </div>
          </div>

          {/* Right: Axis bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              gap: "16px",
            }}
          >
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
                    fontSize: "14px",
                    color: "#737373",
                    width: "56px",
                    textAlign: "right" as const,
                  }}
                >
                  {AXIS_LABELS[key]}
                </span>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    height: "24px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(value / 20) * 100}%`,
                      height: "100%",
                      backgroundColor: "#171717",
                      borderRadius: "12px",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#171717",
                    width: "40px",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 48px",
            borderTop: "1px solid #e5e5e5",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "15px", color: "#a3a3a3" }}>
            あなたのデスクは何点？ →
          </span>
          <span
            style={{ fontSize: "15px", color: "#171717", fontWeight: 700 }}
          >
            desk-ai.vercel.app
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
