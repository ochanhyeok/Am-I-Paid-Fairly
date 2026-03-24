import type { ExperienceLevels } from "@/types";
import { formatCurrency, toMonthly, toHourly, formatHourly } from "@/lib/format";

interface Props {
  baseSalary: number;
  experienceLevels: ExperienceLevels;
  occupationTitle: string;
  context?: string; // e.g. "in Germany"
}

export default function ExperienceLevelSection({
  baseSalary,
  experienceLevels,
  occupationTitle,
  context,
}: Props) {
  const levels = [
    {
      key: "entry",
      label: "Entry-Level",
      ...experienceLevels.entry,
      salary: Math.round(baseSalary * experienceLevels.entry.multiplier),
      color: "bg-blue-500",
      textColor: "text-blue-400",
    },
    {
      key: "mid",
      label: "Mid-Level",
      ...experienceLevels.mid,
      salary: Math.round(baseSalary * experienceLevels.mid.multiplier),
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      key: "senior",
      label: "Senior-Level",
      ...experienceLevels.senior,
      salary: Math.round(baseSalary * experienceLevels.senior.multiplier),
      color: "bg-amber-500",
      textColor: "text-amber-400",
    },
  ];

  const maxSalary = levels[2].salary;

  return (
    <section className="bg-dark-card border border-dark-border rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
        Salary by Experience Level
      </h2>
      <p className="text-slate-500 text-xs mb-5">
        Estimated {occupationTitle} salary{context ? ` ${context}` : ""} by career stage
      </p>

      <div className="flex flex-col gap-4">
        {levels.map((level) => {
          const widthPercent = Math.max(
            Math.round((level.salary / maxSalary) * 100),
            15
          );
          return (
            <div key={level.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${level.textColor}`}>
                    {level.label}
                  </span>
                  <span className="text-slate-600 text-xs">
                    {level.yearsRange}
                  </span>
                </div>
                <span className="text-slate-200 text-sm font-bold tabular-nums">
                  {formatCurrency(level.salary)}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${level.color} transition-all flex items-center justify-end pr-2`}
                  style={{ width: `${widthPercent}%` }}
                >
                  <span className="text-[10px] text-white/80 font-medium whitespace-nowrap tabular-nums">
                    {formatCurrency(toMonthly(level.salary))}/mo
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-4 pt-3 border-t border-dark-border grid grid-cols-3 gap-2 text-center">
        {levels.map((level) => (
          <div key={level.key}>
            <p className="text-slate-600 text-[10px] uppercase">{level.label}</p>
            <p className="text-slate-400 text-xs tabular-nums">
              {formatHourly(toHourly(level.salary))}/hr
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
