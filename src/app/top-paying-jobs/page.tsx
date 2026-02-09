import type { Metadata } from "next";
import Link from "next/link";
import { getOccupations } from "@/lib/data-loader";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Top Paying Jobs Worldwide (2026) | Am I Paid Fairly?",
  description:
    "Discover the highest paying occupations globally. See salary rankings for 175 jobs across 42 countries, based on OECD and BLS data.",
  openGraph: {
    title: "Top Paying Jobs Worldwide (2026) | Am I Paid Fairly?",
    description: "Discover the highest paying occupations globally across 42 countries.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Paying Jobs Worldwide (2026)",
    description: "Discover the highest paying occupations globally across 42 countries.",
  },
  alternates: {
    canonical: "https://amipaidfairly.com/top-paying-jobs",
  },
};

export default function TopPayingJobsPage() {
  const occupations = getOccupations();

  // baseUSA 기준 내림차순 정렬
  const sorted = [...occupations].sort((a, b) => b.baseUSA - a.baseUSA);
  const maxSalary = sorted[0]?.baseUSA ?? 1;

  // 카테고리별 색상
  const categoryColors: Record<string, string> = {
    Tech: "bg-blue-500/20 text-blue-400",
    Healthcare: "bg-emerald-500/20 text-emerald-400",
    Finance: "bg-yellow-500/20 text-yellow-400",
    Engineering: "bg-orange-500/20 text-orange-400",
    Business: "bg-purple-500/20 text-purple-400",
    Legal: "bg-red-500/20 text-red-400",
    Education: "bg-cyan-500/20 text-cyan-400",
    Trades: "bg-amber-500/20 text-amber-400",
    Science: "bg-teal-500/20 text-teal-400",
    Service: "bg-pink-500/20 text-pink-400",
    Transportation: "bg-slate-500/20 text-slate-400",
    Design: "bg-fuchsia-500/20 text-fuchsia-400",
    Media: "bg-indigo-500/20 text-indigo-400",
    "Public Service": "bg-sky-500/20 text-sky-400",
    Agriculture: "bg-lime-500/20 text-lime-400",
  };

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Paying Jobs Worldwide (2026)",
    description: "Highest paying occupations ranked by U.S. base salary",
    numberOfItems: sorted.length,
    itemListElement: sorted.slice(0, 10).map((occ, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: occ.title,
      url: `https://amipaidfairly.com/salary/${occ.slug}`,
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
          <span className="text-slate-300">Top Paying Jobs</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Top Paying Jobs Worldwide
            <span className="text-slate-500"> (2026)</span>
          </h1>
          <p className="text-slate-400 text-sm mt-3">
            {sorted.length} occupations ranked by U.S. base salary
          </p>
        </header>

        {/* Top 10 bar chart */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            Top 10 Highest Paying Jobs
          </h2>
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-3">
            {sorted.slice(0, 10).map((occ, i) => {
              const widthPercent = (occ.baseUSA / maxSalary) * 100;
              return (
                <Link
                  key={occ.slug}
                  href={`/salary/${occ.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="text-sm text-slate-500 w-6 text-right shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-sm text-slate-300 w-40 sm:w-52 shrink-0 truncate group-hover:text-white transition-colors">
                    {occ.title}
                  </span>
                  <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-500 rounded-md"
                      style={{ width: `${widthPercent}%` }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-200">
                      {formatCurrency(occ.baseUSA)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Full list */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-4">
            All {sorted.length} Occupations
          </h2>

          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-[3rem_1fr_7rem_7rem] gap-2 px-4 pb-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <span>#</span>
            <span>Occupation</span>
            <span className="text-right">US Salary</span>
            <span className="text-right">Category</span>
          </div>

          <div className="flex flex-col gap-1">
            {sorted.map((occ, i) => (
              <Link
                key={occ.slug}
                href={`/salary/${occ.slug}`}
                className="group grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_7rem_7rem] gap-2 px-4 py-3 rounded-xl bg-dark-card border border-dark-border hover:border-slate-600 transition-colors items-center"
              >
                <span
                  className={`text-sm font-bold ${
                    i < 3 ? "text-emerald-400" : i < 10 ? "text-yellow-400" : "text-slate-600"
                  }`}
                >
                  #{i + 1}
                </span>
                <span className="text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                  {occ.title}
                </span>
                <span className="text-sm font-semibold text-slate-100 text-right">
                  {formatCurrency(occ.baseUSA)}
                </span>
                <span className="hidden sm:block text-right">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      categoryColors[occ.category] || "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {occ.category}
                  </span>
                </span>
              </Link>
            ))}
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
            All salary figures are estimates based on U.S. Bureau of Labor
            Statistics (BLS) data. Actual salaries vary by experience, company,
            location, and other factors.
          </p>
        </footer>
      </div>
    </main>
  );
}
