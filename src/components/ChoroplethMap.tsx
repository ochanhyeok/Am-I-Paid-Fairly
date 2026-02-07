"use client";

import { useState, useMemo, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import type { CountryComparison } from "@/types";
import { formatCurrency, formatPercentile } from "@/lib/format";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO 3166-1 numeric → alpha-2 매핑 (주요 국가)
const numericToAlpha2: Record<string, string> = {
  "840": "US", "410": "KR", "392": "JP", "276": "DE", "826": "GB",
  "250": "FR", "756": "CH", "036": "AU", "124": "CA", "528": "NL",
  "752": "SE", "578": "NO", "208": "DK", "372": "IE", "040": "AT",
  "056": "BE", "246": "FI", "554": "NZ", "380": "IT", "724": "ES",
  "620": "PT", "616": "PL", "203": "CZ", "348": "HU", "703": "SK",
  "300": "GR", "376": "IL", "792": "TR", "484": "MX", "152": "CL",
  "170": "CO", "188": "CR", "440": "LT", "428": "LV", "233": "EE",
  "705": "SI", "442": "LU", "352": "IS", "356": "IN", "156": "CN",
  "702": "SG", "076": "BR",
};

interface Props {
  comparisons: CountryComparison[];
  userSalaryUSD: number;
  occupationTitle: string;
}

// 색상 스케일 (유저 연봉 대비)
function getColor(estimatedSalary: number, userSalaryUSD: number): string {
  if (estimatedSalary === 0) return "#334155"; // 데이터 없음
  const ratio = estimatedSalary / userSalaryUSD;
  if (ratio > 1.5) return "#22c55e"; // 훨씬 높음
  if (ratio > 1.15) return "#84cc16"; // 약간 높음
  if (ratio > 0.85) return "#eab308"; // 비슷
  if (ratio > 0.5) return "#f97316"; // 약간 낮음
  return "#ef4444"; // 훨씬 낮음
}

function ChoroplethMap({ comparisons, userSalaryUSD, occupationTitle }: Props) {
  const [tooltip, setTooltip] = useState<{
    name: string;
    salary: string;
    percentile: string;
    x: number;
    y: number;
  } | null>(null);

  // 국가 코드 → 비교 데이터 맵
  const compMap = useMemo(() => {
    const map = new Map<string, CountryComparison>();
    comparisons.forEach((c) => map.set(c.country.code, c));
    return map;
  }, [comparisons]);

  return (
    <div className="bg-dark-card rounded-2xl p-4 border border-dark-border">
      <h3 className="text-slate-200 font-bold text-sm mb-3">
        {occupationTitle} Salary — Global Map
      </h3>

      <div className="relative bg-slate-950 rounded-xl overflow-hidden">
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 20] }}
          width={800}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericCode = geo.id;
                  const alpha2 = numericToAlpha2[numericCode];
                  const comp = alpha2 ? compMap.get(alpha2) : undefined;
                  const fillColor = comp
                    ? getColor(comp.estimatedSalary, userSalaryUSD)
                    : "#1e293b";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#0f172a"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "#60a5fa" },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(e) => {
                        if (comp) {
                          const rect = (e.target as SVGElement)
                            .closest("svg")
                            ?.getBoundingClientRect();
                          setTooltip({
                            name: comp.country.name,
                            salary: formatCurrency(comp.estimatedSalary),
                            percentile: formatPercentile(comp.percentile),
                            x: e.clientX - (rect?.left ?? 0),
                            y: e.clientY - (rect?.top ?? 0) - 10,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl z-10"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="text-white font-semibold">{tooltip.name}</div>
            <div className="text-slate-300">{tooltip.salary} USD</div>
            <div className="text-slate-400">{tooltip.percentile}</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-slate-500">
        {[
          { color: "#ef4444", label: "<<" },
          { color: "#f97316", label: "<" },
          { color: "#eab308", label: "≈" },
          { color: "#84cc16", label: ">" },
          { color: "#22c55e", label: ">>" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              className="w-3 h-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
        <span className="ml-2 text-slate-600">vs your salary</span>
      </div>
    </div>
  );
}

export default memo(ChoroplethMap);
