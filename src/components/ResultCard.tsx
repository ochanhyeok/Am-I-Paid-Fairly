"use client";

import CountUpAnimation from "./CountUpAnimation";

interface Props {
  percentile: number; // 0~100 (유저가 넘어선 비율)
  occupationTitle: string;
}

export default function ResultCard({ percentile, occupationTitle }: Props) {
  // 색상: 상위 50%↑ → green, 30~50% → yellow, 30%↓ → red
  const bgColor =
    percentile >= 50
      ? "bg-emerald-500"
      : percentile >= 30
        ? "bg-yellow-500"
        : "bg-red-500";

  const lightTextColor =
    percentile >= 50
      ? "text-emerald-100"
      : percentile >= 30
        ? "text-yellow-100"
        : "text-red-100";

  return (
    <div className={`${bgColor} rounded-2xl p-6 text-center`}>
      <p className={`${lightTextColor} text-sm`}>You earn more than</p>
      <CountUpAnimation
        value={percentile}
        className="text-6xl font-black text-white leading-none block my-2"
      />
      <p className={`${lightTextColor} text-sm`}>
        of {occupationTitle}s worldwide
      </p>
    </div>
  );
}
