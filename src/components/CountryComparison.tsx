"use client";

import { useState } from "react";
import type { CountryComparison } from "@/types";
import { formatCurrency, formatPercentile, formatNumber } from "@/lib/format";

interface Props {
  comparisons: CountryComparison[];
  userCountryCode: string;
}

export default function CountryComparisonList({
  comparisons,
  userCountryCode,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? comparisons : comparisons.slice(0, 10);

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <h3 className="text-slate-200 font-bold text-sm mb-4">
        Country Comparison
      </h3>

      <div className="flex flex-col gap-1.5">
        {displayed.map((comp) => {
          const isUser = comp.country.code === userCountryCode;
          const pctText = formatPercentile(comp.percentile);
          const pctColor =
            comp.percentile >= 70
              ? "text-emerald-400"
              : comp.percentile >= 40
                ? "text-yellow-400"
                : "text-red-400";

          return (
            <div
              key={comp.country.code}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isUser
                  ? "bg-slate-800 border border-yellow-500/30"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <span className="text-xl sm:text-2xl shrink-0">{comp.country.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 font-semibold text-sm truncate">
                  {comp.country.name}
                  {isUser && (
                    <span className="text-yellow-400 text-xs ml-1.5">
                      (You)
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-[11px] sm:text-xs truncate">
                  {formatCurrency(comp.estimatedSalary)} · PPP {formatCurrency(comp.pppAdjusted)}
                  <span className="hidden sm:inline"> · 🍔 {formatNumber(comp.bigMacCount)}</span>
                </div>
              </div>
              <div
                className={`${pctColor} font-bold text-xs text-right shrink-0`}
              >
                {pctText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show all toggle */}
      {comparisons.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          {showAll
            ? "Show less"
            : `Show all ${comparisons.length} countries`}
        </button>
      )}
    </div>
  );
}
