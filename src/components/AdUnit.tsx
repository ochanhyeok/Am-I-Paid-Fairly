"use client";

import { useEffect, useRef } from "react";

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

// 광고 포맷별 최소 높이 (CLS 방지)
const MIN_HEIGHT: Record<string, string> = {
  rectangle: "min-h-[250px]",
  horizontal: "min-h-[90px]",
  vertical: "min-h-[600px]",
  auto: "min-h-[90px]",
};

export default function AdUnit({ slot, format = "auto", className = "" }: Props) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current) return;
    try {
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense 로드 실패 시 무시
    }
  }, []);

  if (!ADSENSE_ID) return null;

  const minH = MIN_HEIGHT[format] ?? MIN_HEIGHT.auto;

  return (
    <div
      className={`overflow-hidden ${minH} flex items-center justify-center bg-white/5 rounded-lg ${className}`}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
