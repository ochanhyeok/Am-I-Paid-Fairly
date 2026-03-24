import CountUpAnimation from "./CountUpAnimation";

interface Props {
  percentile: number; // 0~100 (유저가 넘어선 비율)
  occupationTitle: string;
}

export default function ResultCard({ percentile, occupationTitle }: Props) {
  const isTop = percentile >= 50;
  const displayValue = Math.max(isTop ? 100 - percentile : percentile, 1);

  // 색상: 상위 70%↑ → green (Top 30%), 40~70% → yellow (Middle), 40%↓ → red (Bottom 40%)
  const bgColor =
    percentile >= 70
      ? "bg-emerald-500"
      : percentile >= 40
        ? "bg-yellow-500"
        : "bg-red-500";

  const lightTextColor =
    percentile >= 70
      ? "text-emerald-100"
      : percentile >= 40
        ? "text-yellow-100"
        : "text-red-100";

  return (
    <div className={`${bgColor} rounded-2xl p-6 text-center`}>
      <p className={`${lightTextColor} text-sm`}>
        {isTop ? "You're in the" : "You're in the"}
      </p>
      <div className="flex items-baseline justify-center gap-2 my-2">
        <span className={`${lightTextColor} text-2xl font-bold`}>
          {isTop ? "Top" : "Bottom"}
        </span>
        <CountUpAnimation
          value={displayValue}
          className="text-6xl font-extrabold text-white leading-none"
        />
      </div>
      <p className={`${lightTextColor} text-sm`}>
        of {occupationTitle}s worldwide
      </p>
    </div>
  );
}
