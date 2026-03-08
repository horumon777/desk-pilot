"use client";

import { useState } from "react";

const matrix = {
  brands: [
    { name: "セブンカフェ", x: 82, y: 75, price: "¥140", score: "7.0", color: "#E53E3E", size: 22, main: true },
    { name: "ドトール", x: 38, y: 42, price: "¥280", score: "6.6", color: "#4A5568", size: 16 },
    { name: "ベローチェ", x: 28, y: 38, price: "¥330", score: "—", color: "#718096", size: 14 },
  ],
};

const advantages = [
  { icon: "📍", label: "21,000店舗", sub: "ドトールの約20倍" },
  { icon: "🎨", label: "デザイン品質", sub: "佐藤可士和監修" },
  { icon: "🛒", label: "ついで買い", sub: "専門店と土俵が違う" },
];

export default function Slide() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "#111",
          borderRadius: "4px",
          border: "1px solid #222",
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: "#E53E3E",
            padding: "20px 36px",
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            セブンカフェの優位性
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "11px",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "2px",
            }}
          >
            競合比較 2024
          </div>
        </div>

        {/* サブヘッド */}
        <div style={{ padding: "24px 36px 0" }}>
          <div
            style={{
              fontSize: "15px",
              color: "#aaa",
              fontFamily: "sans-serif",
              lineHeight: 1.6,
              borderLeft: "3px solid #E53E3E",
              paddingLeft: "14px",
            }}
          >
            コーヒーチェーンより
            <span style={{ color: "#fff", fontWeight: "600" }}>安く・高品質</span>
            で、
            <span style={{ color: "#fff", fontWeight: "600" }}>全国21,000店舗</span>
            で買える。しかも
            <span style={{ color: "#E53E3E", fontWeight: "600" }}>
              コーヒーのためだけに立ち寄らなくていい。
            </span>
          </div>
        </div>

        {/* メインコンテンツ: 2カラム */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: "24px 36px 28px",
            gap: "0",
          }}
        >
          {/* 左: 価格 vs 品質マトリクス */}
          <div style={{ paddingRight: "24px", borderRight: "1px solid #222" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#555",
                fontFamily: "monospace",
                letterSpacing: "1.5px",
                marginBottom: "12px",
                textTransform: "uppercase",
              }}
            >
              価格 vs 品質マトリクス
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "85%",
                background: "#0d0d0d",
                border: "1px solid #1a1a1a",
                borderRadius: "2px",
              }}
            >
              <div style={{ position: "absolute", inset: 0, padding: "20px" }}>
                {/* 軸 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    right: "20px",
                    height: "1px",
                    background: "#2a2a2a",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "20px",
                    bottom: "20px",
                    width: "1px",
                    background: "#2a2a2a",
                  }}
                />

                {/* 軸ラベル */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "20px",
                    fontSize: "9px",
                    color: "#444",
                    fontFamily: "monospace",
                  }}
                >
                  高コスパ →
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: "4px",
                    top: "20px",
                    fontSize: "9px",
                    color: "#444",
                    fontFamily: "monospace",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  高品質 ↑
                </div>

                {/* 優位ゾーン */}
                <div
                  style={{
                    position: "absolute",
                    right: "24px",
                    top: "24px",
                    width: "38%",
                    height: "38%",
                    background: "rgba(229,62,62,0.04)",
                    border: "1px dashed rgba(229,62,62,0.15)",
                    borderRadius: "2px",
                  }}
                />

                {/* ブランドドット */}
                {matrix.brands.map((b) => (
                  <div
                    key={b.name}
                    onMouseEnter={() => setHover(b.name)}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      position: "absolute",
                      left: `calc(20px + (100% - 40px) * ${b.x / 100})`,
                      bottom: `calc(20px + (100% - 40px) * ${b.y / 100})`,
                      transform: "translate(-50%, 50%)",
                      cursor: "default",
                    }}
                  >
                    <div
                      style={{
                        width: b.size,
                        height: b.size,
                        borderRadius: "50%",
                        background: b.color,
                        opacity: hover === b.name ? 1 : b.main ? 0.9 : 0.5,
                        border: b.main ? "2px solid #E53E3E" : "none",
                        boxShadow: b.main
                          ? "0 0 16px rgba(229,62,62,0.4)"
                          : "none",
                        transition: "all 0.2s ease",
                      }}
                    />
                    {/* ラベル */}
                    <div
                      style={{
                        position: "absolute",
                        top: b.main ? "-28px" : "-22px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        fontSize: b.main ? "11px" : "9px",
                        fontWeight: b.main ? "700" : "400",
                        color: b.main ? "#E53E3E" : "#666",
                        fontFamily: "sans-serif",
                        opacity: hover === b.name || b.main ? 1 : 0.7,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      {b.name}
                    </div>

                    {/* ツールチップ */}
                    {hover === b.name && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: `${b.size + 32}px`,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "#1a1a1a",
                          border: "1px solid #333",
                          borderRadius: "3px",
                          padding: "8px 12px",
                          whiteSpace: "nowrap",
                          fontSize: "11px",
                          fontFamily: "sans-serif",
                          color: "#ccc",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                          zIndex: 10,
                        }}
                      >
                        <div style={{ fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
                          {b.name}
                        </div>
                        <div>
                          価格: <span style={{ color: "#E53E3E" }}>{b.price}</span>
                        </div>
                        <div>
                          評価: <span style={{ color: "#E53E3E" }}>{b.score}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右: 優位性カード */}
          <div style={{ paddingLeft: "24px" }}>
            <div
              style={{
                fontSize: "10px",
                color: "#555",
                fontFamily: "monospace",
                letterSpacing: "1.5px",
                marginBottom: "12px",
                textTransform: "uppercase",
              }}
            >
              構造的な優位性
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {advantages.map((a, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid #1a1a1a",
                    borderRadius: "3px",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#1a1a1a")
                  }
                >
                  <div
                    style={{
                      fontSize: "24px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(229,62,62,0.08)",
                      borderRadius: "4px",
                      flexShrink: 0,
                    }}
                  >
                    {a.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#fff",
                        fontFamily: "sans-serif",
                        marginBottom: "2px",
                      }}
                    >
                      {a.label}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {a.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ボトムライン */}
            <div
              style={{
                marginTop: "16px",
                padding: "14px 16px",
                background: "rgba(229,62,62,0.06)",
                border: "1px solid rgba(229,62,62,0.12)",
                borderRadius: "3px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#E53E3E",
                  fontWeight: "600",
                  fontFamily: "sans-serif",
                  lineHeight: 1.5,
                }}
              >
                結論: セブンカフェは「コーヒー専門店」ではなく「コンビニの付加価値」として独自のポジションを確立
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            padding: "12px 36px",
            borderTop: "1px solid #1a1a1a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#333",
              fontFamily: "monospace",
              letterSpacing: "1px",
            }}
          >
            SOURCE: 各社公開情報 / コーヒー品質スコアは独自調査
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "#333",
              fontFamily: "monospace",
            }}
          >
            CONFIDENTIAL
          </div>
        </div>
      </div>
    </div>
  );
}
