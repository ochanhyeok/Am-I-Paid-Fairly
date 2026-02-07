import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Am I Paid Fairly?";
  const percentile = searchParams.get("percentile") || "";
  const occupation = searchParams.get("occupation") || "";
  const country = searchParams.get("country") || "";

  // 색상: 상위 50%↑ → green, 30~50% → yellow, 30%↓ → red
  const pctNum = parseInt(percentile, 10);
  const pctColor = pctNum >= 50 ? "#10b981" : pctNum >= 30 ? "#eab308" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: 20,
            color: "#64748b",
            marginBottom: 12,
          }}
        >
          amipaidfairly.com
        </div>

        {/* Main content */}
        {percentile ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 28, color: "#94a3b8", marginBottom: 8 }}>
              {occupation ? `As a ${occupation}` : "I earn more than"}
            </div>
            <div
              style={{
                fontSize: 120,
                fontWeight: 900,
                color: pctColor,
                lineHeight: 1,
              }}
            >
              {percentile}%
            </div>
            <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 8 }}>
              {occupation
                ? `I earn more than ${percentile}% worldwide`
                : "of workers worldwide"}
            </div>
            {country && (
              <div style={{ fontSize: 22, color: "#475569", marginTop: 16 }}>
                {country}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: "#f8fafc",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 24, color: "#64748b", marginTop: 16 }}>
              Compare your salary with 38+ countries
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 16,
            color: "#334155",
          }}
        >
          Estimated based on OECD & BLS data
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
