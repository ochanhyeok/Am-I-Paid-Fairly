import type { Specialization } from "@/types";
import { formatCurrency } from "@/lib/format";

interface Props {
  specializations: Specialization[];
  baseSalary: number;
  occupationTitle: string;
}

export default function SpecializationsGrid({
  specializations,
  baseSalary,
  occupationTitle,
}: Props) {
  if (!specializations || specializations.length === 0) return null;

  // multiplier 내림차순 정렬
  const sorted = [...specializations].sort(
    (a, b) => b.multiplier - a.multiplier
  );
  const maxMultiplier = sorted[0].multiplier;

  return (
    <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
        Specializations
      </h2>
      <p className="text-slate-500 text-xs mb-5">
        How {occupationTitle} sub-fields compare in estimated pay
      </p>

      <div className="flex flex-col gap-3">
        {sorted.map((spec) => {
          const salary = Math.round(baseSalary * spec.multiplier);
          const diff = Math.round((spec.multiplier - 1) * 100);
          const widthPercent = Math.max(
            Math.round((spec.multiplier / maxMultiplier) * 100),
            20
          );
          const isAbove = diff >= 0;

          return (
            <div key={spec.slug}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-200 text-sm font-medium">
                  {spec.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isAbove ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isAbove ? "+" : ""}
                    {diff}%
                  </span>
                  <span className="text-slate-300 text-sm font-bold tabular-nums">
                    {formatCurrency(salary)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isAbove ? "bg-emerald-500/70" : "bg-slate-600"
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <p className="text-slate-600 text-xs mt-0.5">{spec.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
