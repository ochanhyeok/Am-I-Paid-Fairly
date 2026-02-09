import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// 파라미터 새니타이징: 길이 제한 + 허용 문자만 통과
function sanitize(value: string, maxLen: number): string {
  return value.replace(/[^\w\s.,!?%&()$'→\-]/g, "").slice(0, maxLen);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = sanitize(searchParams.get("title") || "", 100);
  const subtitle = sanitize(searchParams.get("subtitle") || "", 120);
  const percentile = sanitize(searchParams.get("percentile") || "", 3);
  const occupation = sanitize(searchParams.get("occupation") || "", 80);
  const salary = sanitize(searchParams.get("salary") || "", 20);
  const verdict = sanitize(searchParams.get("verdict") || "", 20);

  // 색상: 상위 50%↑ → green, 30~50% → yellow, 30%↓ → red
  const pctNum = parseInt(percentile, 10);
  const pctColor = pctNum >= 50 ? "#10b981" : pctNum >= 30 ? "#eab308" : "#ef4444";

  // Verdict 색상
  const verdictColor =
    verdict === "strong-yes" || verdict === "yes"
      ? "#10b981"
      : verdict === "neutral"
        ? "#eab308"
        : verdict === "no" || verdict === "strong-no"
          ? "#ef4444"
          : "#64748b";

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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 상단 브랜드 바 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #3b82f6, #10b981)",
          }}
        />

        {/* 로고 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              background: "linear-gradient(90deg, #60a5fa, #34d399)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            AIPF
          </div>
          <div style={{ fontSize: 18, color: "#64748b" }}>
            Am I Paid Fairly?
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {percentile ? (
          // 결과 페이지용 (퍼센타일 표시)
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 26, color: "#94a3b8", marginBottom: 8 }}>
              {occupation ? `As a ${occupation}` : "I earn more than"}
            </div>
            <div
              style={{
                fontSize: 112,
                fontWeight: 900,
                color: pctColor,
                lineHeight: 1,
              }}
            >
              {percentile}%
            </div>
            <div style={{ fontSize: 26, color: "#94a3b8", marginTop: 8 }}>
              {occupation
                ? `I earn more than ${percentile}% worldwide`
                : "of workers worldwide"}
            </div>
          </div>
        ) : (
          // 일반 페이지용 (제목 + 부제)
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: title.length > 50 ? 34 : title.length > 30 ? 42 : 48,
                fontWeight: 900,
                color: "#f8fafc",
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 1000,
              }}
            >
              {title || "Are you paid fairly compared to the world?"}
            </div>
            {salary && (
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  color: "#10b981",
                  marginTop: 16,
                }}
              >
                {salary}
              </div>
            )}
            {verdict && (
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: verdictColor,
                  marginTop: 16,
                  padding: "8px 24px",
                  borderRadius: 12,
                  border: `2px solid ${verdictColor}33`,
                  backgroundColor: `${verdictColor}15`,
                }}
              >
                {verdict === "strong-yes"
                  ? "Strongly Recommended"
                  : verdict === "yes"
                    ? "Worth Considering"
                    : verdict === "neutral"
                      ? "Break Even"
                      : verdict === "no"
                        ? "Think Twice"
                        : verdict === "strong-no"
                          ? "Not Recommended"
                          : ""}
              </div>
            )}
            <div
              style={{
                fontSize: 22,
                color: "#64748b",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              {subtitle || "Compare your salary across 42 countries and 98 cities"}
            </div>
          </div>
        )}

        {/* 하단 태그라인 */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 15,
            color: "#475569",
          }}
        >
          <span>42 Countries</span>
          <span style={{ color: "#334155" }}>·</span>
          <span>175+ Occupations</span>
          <span style={{ color: "#334155" }}>·</span>
          <span>98 Cities</span>
          <span style={{ color: "#334155" }}>·</span>
          <span>Free &amp; No Login</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
