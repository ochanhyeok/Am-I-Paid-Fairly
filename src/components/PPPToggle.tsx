"use client";

import { useState } from "react";

type Mode = "nominal" | "ppp";

interface Props {
  nominal: string;
  pppAdjusted: string;
  size?: "sm" | "lg";
}

export default function PPPToggle({ nominal, pppAdjusted, size = "lg" }: Props) {
  const [mode, setMode] = useState<Mode>("nominal");

  const textSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div>
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setMode("nominal")}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            mode === "nominal"
              ? "bg-blue-500/20 text-blue-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Nominal
        </button>
        <button
          onClick={() => setMode("ppp")}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            mode === "ppp"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          PPP
        </button>
      </div>
      <p className={`${textSize} font-bold text-slate-50`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {mode === "nominal" ? nominal : pppAdjusted}
        <span className="text-xs text-slate-500 ml-1">
          {mode === "ppp" ? "PPP" : "USD"}
        </span>
      </p>
    </div>
  );
}
