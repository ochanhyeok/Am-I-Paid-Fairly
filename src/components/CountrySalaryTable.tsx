"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "nominal" | "ppp";

interface CountryRow {
  code: string;
  slug: string;
  name: string;
  flag: string;
  estimatedSalary: number;
  pppAdjusted: number;
  formattedSalary: string;
  formattedPPP: string;
  formattedBigMac: string;
}

interface Props {
  rows: CountryRow[];
  occupationSlug: string;
}

export default function CountrySalaryTable({ rows, occupationSlug }: Props) {
  const [mode, setMode] = useState<Mode>("nominal");

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-200 font-bold text-lg">
          Salary by Country
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("nominal")}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mode === "nominal"
                ? "bg-blue-500/20 text-blue-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Nominal USD
          </button>
          <button
            onClick={() => setMode("ppp")}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mode === "ppp"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            PPP-Adjusted
          </button>
        </div>
      </div>

      {/* Table header (desktop) */}
      <div className="hidden md:grid md:grid-cols-[2.5rem_1fr_8rem_6rem] gap-3 px-4 pb-2 text-xs text-slate-500 font-medium">
        <span>#</span>
        <span>Country</span>
        <span className="text-right">
          {mode === "nominal" ? "Salary (USD)" : "PPP-Adjusted"}
        </span>
        <span className="text-right">Big Macs</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((row, index) => (
          <Link
            key={row.code}
            href={`/salary/${occupationSlug}/${row.slug}`}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-card border border-dark-border hover:border-slate-600 transition-colors"
          >
            {/* Rank */}
            <span className="text-slate-600 text-xs font-mono w-6 shrink-0 text-right">
              {index + 1}
            </span>

            {/* Flag + Name */}
            <span className="text-2xl shrink-0">{row.flag}</span>
            <span className="flex-1 min-w-0 text-slate-200 font-semibold text-sm truncate group-hover:text-white transition-colors">
              {row.name}
            </span>

            {/* Salary */}
            <span
              className="text-slate-100 font-bold text-sm text-right w-20 md:w-[8rem] shrink-0"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {mode === "nominal" ? row.formattedSalary : row.formattedPPP}
            </span>

            {/* Big Mac count - hidden on mobile */}
            <span className="hidden md:block text-slate-400 text-sm text-right w-[6rem] shrink-0">
              {row.formattedBigMac}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
