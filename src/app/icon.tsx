import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "7px",
        }}
      >
        {/* 저울 아이콘 — SVG inline */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 기둥 */}
          <line x1="16" y1="8" x2="16" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* 받침대 */}
          <line x1="12" y1="26" x2="20" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* 빔 (기울어진) */}
          <line x1="5" y1="6" x2="27" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* 피벗 */}
          <circle cx="16" cy="8" r="1.5" fill="white" />
          {/* 왼쪽 줄 */}
          <line x1="5.5" y1="6" x2="5.5" y2="12" stroke="white" strokeWidth="1.2" />
          {/* 왼쪽 접시 */}
          <path d="M 2 12 Q 5.5 16 9 12" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* 오른쪽 줄 */}
          <line x1="26.5" y1="10" x2="26.5" y2="16" stroke="white" strokeWidth="1.2" />
          {/* 오른쪽 접시 */}
          <path d="M 23 16 Q 26.5 20 30 16" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
