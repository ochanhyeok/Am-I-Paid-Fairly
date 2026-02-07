"use client";

import type { CountryComparison } from "@/types";
import { formatPercentile } from "@/lib/format";

interface Props {
  comparisons: CountryComparison[];
}

export default function CountryMiniCards({ comparisons }: Props) {
  return (
    <div className="flex gap-2">
      {comparisons.map((comp) => {
        const pctText = formatPercentile(comp.percentile);
        const isTop = pctText.startsWith("Top");
        const color = comp.percentile >= 70
          ? "text-emerald-400"
          : comp.percentile >= 40
            ? "text-yellow-400"
            : "text-red-400";

        return (
          <div
            key={comp.country.code}
            className="flex-1 bg-dark-card rounded-lg p-3 text-center min-w-[90px]"
          >
            <div className="text-xl">{comp.country.flag}</div>
            <div className="text-slate-500 text-xs mt-1">
              In {comp.country.name.split(" ")[0]}
            </div>
            <div className={`${color} font-bold text-sm mt-0.5`}>
              {pctText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
