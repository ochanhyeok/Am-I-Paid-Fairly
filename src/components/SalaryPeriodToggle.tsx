"use client";

import { useState } from "react";

type Period = "yearly" | "monthly" | "hourly";

interface Props {
  yearly: string;
  monthly: string;
  hourly: string;
}

const LABELS: Record<Period, string> = {
  yearly: "Year",
  monthly: "Month",
  hourly: "Hour",
};

const SUFFIXES: Record<Period, string> = {
  yearly: "/yr",
  monthly: "/mo",
  hourly: "/hr",
};

export default function SalaryPeriodToggle({ yearly, monthly, hourly }: Props) {
  const [period, setPeriod] = useState<Period>("yearly");
  const values: Record<Period, string> = { yearly, monthly, hourly };

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(["yearly", "monthly", "hourly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              period === p
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>
      <p className="text-2xl font-bold text-slate-50" style={{ fontVariantNumeric: "tabular-nums" }}>
        {values[period]}
        <span className="text-sm text-slate-500 ml-1">{SUFFIXES[period]}</span>
      </p>
    </div>
  );
}
