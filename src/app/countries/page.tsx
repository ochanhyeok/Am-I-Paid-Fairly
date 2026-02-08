import type { Metadata } from "next";
import Link from "next/link";
import { getCountries, getOccupations } from "@/lib/data-loader";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Salary by Country — 42 Countries Compared | Am I Paid Fairly?",
  description:
    "Compare average wages, GDP per capita, and salary data across 42 countries. See which countries pay the most and explore occupation-specific salaries.",
  alternates: {
    canonical: "https://amipaidfairly.com/countries",
  },
};

export default function CountriesPage() {
  const countries = getCountries();
  const occupations = getOccupations();

  // OECD 평균임금 기준 내림차순 정렬
  const sorted = [...countries].sort(
    (a, b) => b.oecdAvgWage - a.oecdAvgWage
  );
  const maxWage = sorted[0]?.oecdAvgWage ?? 1;

  // 인기 직업 5개 (salary 페이지 링크용)
  const popularOccupations = occupations
    .filter((o) =>
      [
        "software-engineer",
        "nurse",
        "teacher",
        "accountant",
        "doctor",
      ].includes(o.slug)
    )
    .sort((a, b) => b.baseUSA - a.baseUSA);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Salary by Country — 42 Countries Compared",
    description: "Countries ranked by OECD average wage",
    numberOfItems: sorted.length,
    itemListElement: sorted.slice(0, 10).map((country, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: country.name,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Countries</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Salary by Country
          </h1>
          <p className="text-slate-400 text-sm mt-3">
            {sorted.length} countries ranked by OECD average wage
          </p>
        </header>

        {/* Top 10 bar chart */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Top 10 Highest Paying Countries
          </h2>
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-3">
            {sorted.slice(0, 10).map((country, i) => {
              const widthPercent = (country.oecdAvgWage / maxWage) * 100;
              return (
                <div key={country.code} className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 w-6 text-right shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-lg shrink-0">{country.flag}</span>
                  <span className="text-sm text-slate-300 w-28 sm:w-36 shrink-0 truncate">
                    {country.name}
                  </span>
                  <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-blue-500 rounded-md"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                      {formatCurrency(country.oecdAvgWage)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Full country list */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            All {sorted.length} Countries
          </h2>

          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-[3rem_1fr_7rem_7rem_5rem] gap-2 px-4 pb-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span>#</span>
            <span>Country</span>
            <span className="text-right">Avg Wage</span>
            <span className="text-right">GDP/Cap</span>
            <span className="text-right">Currency</span>
          </div>

          <div className="flex flex-col gap-1">
            {sorted.map((country, i) => (
              <div
                key={country.code}
                className="group grid grid-cols-[2.5rem_auto_1fr_auto] sm:grid-cols-[3rem_1fr_7rem_7rem_5rem] gap-2 px-4 py-3 rounded-xl bg-dark-card border border-dark-border items-center"
              >
                <span
                  className={`text-sm font-bold ${
                    i < 3 ? "text-blue-400" : "text-slate-600"
                  }`}
                >
                  #{i + 1}
                </span>
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{country.flag}</span>
                  <span className="text-sm text-slate-200 truncate">
                    {country.name}
                  </span>
                </span>
                <span className="text-sm font-semibold text-slate-100 text-right">
                  {formatCurrency(country.oecdAvgWage)}
                </span>
                <span className="hidden sm:block text-sm text-slate-400 text-right">
                  {formatCurrency(country.gdpPerCapita)}
                </span>
                <span className="hidden sm:block text-xs text-slate-500 text-right">
                  {country.currency}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Explore by occupation */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Explore Salaries by Occupation
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            See how specific jobs pay across all {sorted.length} countries
          </p>
          <div className="flex flex-wrap gap-2">
            {popularOccupations.map((occ) => (
              <Link
                key={occ.slug}
                href={`/salary/${occ.slug}`}
                className="text-sm bg-dark-card hover:bg-slate-800/50 border border-dark-border hover:border-slate-600 text-slate-300 hover:text-emerald-400 transition-colors px-4 py-2 rounded-lg"
              >
                {occ.title}
              </Link>
            ))}
            <Link
              href="/browse"
              className="text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors px-4 py-2 rounded-lg"
            >
              Browse all 175+ jobs →
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full text-sm transition-colors"
          >
            Compare your own salary
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <footer className="border-t border-dark-border pt-6 pb-8">
          <p className="text-slate-600 text-[11px] text-center leading-relaxed">
            Average wages are from OECD data. GDP per capita from World Bank.
            Non-OECD countries (India, China, Singapore, Brazil) use estimated
            wage data. All figures are approximate.
          </p>
        </footer>
      </div>
    </main>
  );
}
