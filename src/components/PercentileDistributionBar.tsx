import { formatCurrency } from "@/lib/format";

interface Props {
  percentile10: number;
  percentile25: number;
  median: number;
  percentile75: number;
  percentile90: number;
  highlightValue?: number;
  highlightLabel?: string;
}

export default function PercentileDistributionBar({
  percentile10,
  percentile25,
  median,
  percentile75,
  percentile90,
  highlightValue,
  highlightLabel,
}: Props) {
  const min = percentile10;
  const max = percentile90;
  const range = max - min || 1;

  function toPercent(value: number): number {
    return Math.max(0, Math.min(100, ((value - min) / range) * 100));
  }

  // 금액 축약 (모바일용)
  function shortAmount(value: number): string {
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }
    return formatCurrency(value);
  }

  const markers = [
    { value: percentile10, label: "P10", color: "bg-slate-500", textColor: "text-slate-500" },
    { value: percentile25, label: "P25", color: "bg-blue-500", textColor: "text-blue-400" },
    { value: median, label: "Median", color: "bg-emerald-500", textColor: "text-emerald-400" },
    { value: percentile75, label: "P75", color: "bg-blue-500", textColor: "text-blue-400" },
    { value: percentile90, label: "P90", color: "bg-slate-500", textColor: "text-slate-500" },
  ];

  // 하이라이트 마커 위치 (범위 밖이면 클램프)
  const highlightPercent = highlightValue != null ? toPercent(highlightValue) : null;

  return (
    <div className="w-full">
      {/* Bar */}
      <div className="relative h-8 mt-2 mb-8">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-slate-800 rounded-full" />

        {/* P25-P75 fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500/30 rounded-full"
          style={{
            left: `${toPercent(percentile25)}%`,
            width: `${toPercent(percentile75) - toPercent(percentile25)}%`,
          }}
        />

        {/* Markers */}
        {markers.map((m) => (
          <div
            key={m.label}
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${toPercent(m.value)}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className={`w-3 h-3 rounded-full ${m.color} border-2 border-slate-900`} />
            <div className="absolute top-5 flex flex-col items-center">
              <span className={`text-[10px] font-medium ${m.textColor}`}>{m.label}</span>
              <span className="text-[10px] text-slate-500 hidden sm:block" style={{ fontVariantNumeric: "tabular-nums" }}>
                {shortAmount(m.value)}
              </span>
            </div>
          </div>
        ))}

        {/* Highlight marker */}
        {highlightPercent != null && highlightValue != null && (
          <div
            className="absolute top-1/2 flex flex-col items-center"
            style={{ left: `${highlightPercent}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900 ring-2 ring-red-500/30" />
            <div className="absolute -top-6 flex flex-col items-center whitespace-nowrap">
              <span className="text-[10px] font-bold text-red-400">
                {highlightLabel || shortAmount(highlightValue)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile amounts row */}
      <div className="flex justify-between text-[10px] text-slate-500 sm:hidden" style={{ fontVariantNumeric: "tabular-nums" }}>
        <span>{shortAmount(percentile10)}</span>
        <span>{shortAmount(percentile25)}</span>
        <span className="text-emerald-400 font-medium">{shortAmount(median)}</span>
        <span>{shortAmount(percentile75)}</span>
        <span>{shortAmount(percentile90)}</span>
      </div>
    </div>
  );
}
