import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6, #10b981)",
          borderRadius: "36px",
        }}
      >
        <span
          style={{
            fontSize: "100px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-4px",
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size }
  );
}
