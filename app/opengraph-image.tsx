import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ToiNavi / 近くのトイレマップ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20
        }}
      >
        <div style={{ fontSize: 96, lineHeight: 1 }}>🚻</div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px"
          }}
        >
          ToiNavi
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#94a3b8"
          }}
        >
          近くのトイレマップ
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 20,
            fontWeight: 500,
            color: "#475569"
          }}
        >
          現在地から近くのトイレを探せる、レビュー付きのトイレマップアプリです。
        </div>
      </div>
    ),
    { ...size }
  );
}
