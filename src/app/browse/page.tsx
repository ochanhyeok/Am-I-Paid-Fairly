import type { Metadata } from "next";
import Link from "next/link";
import { getOccupations } from "@/lib/data-loader";

export const metadata: Metadata = {
  title: "Browse All Occupations | Am I Paid Fairly?",
  description:
    "Explore salary data for 175 occupations across 42 countries. Compare salaries by category: Tech, Healthcare, Finance, Engineering, and more.",
  alternates: {
    canonical: "https://amipaidfairly.com/browse",
  },
};

// 카테고리별 아이콘
const categoryIcons: Record<string, string> = {
  Tech: "💻",
  Healthcare: "🏥",
  Finance: "💰",
  Engineering: "⚙️",
  Business: "📊",
  Legal: "⚖️",
  Education: "📚",
  Trades: "🔧",
  Science: "🔬",
  Service: "🛎️",
  Transportation: "🚛",
  Design: "🎨",
  Media: "📺",
  "Public Service": "🏛️",
  Agriculture: "🌾",
};

export default function BrowsePage() {
  const occupations = getOccupations();

  // 카테고리별 그룹화
  const grouped = new Map<string, typeof occupations>();
  occupations.forEach((occ) => {
    if (!grouped.has(occ.category)) {
      grouped.set(occ.category, []);
    }
    grouped.get(occ.category)!.push(occ);
  });

  // 카테고리 수 기준 내림차순 정렬
  const sortedCategories = Array.from(grouped.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">Browse Occupations</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 leading-tight">
            Browse All Occupations
          </h1>
          <p className="text-slate-400 text-sm mt-3">
            {occupations.length} occupations across {sortedCategories.length}{" "}
            categories · 42 countries
          </p>
        </header>

        {/* Category quick nav */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {sortedCategories.map(([category, items]) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-xs bg-dark-card border border-dark-border hover:border-slate-600 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-colors"
            >
              {categoryIcons[category] || "📋"} {category} ({items.length})
            </a>
          ))}
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-10">
          {sortedCategories.map(([category, items]) => (
            <section
              key={category}
              id={category.toLowerCase().replace(/\s+/g, "-")}
            >
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-xl">
                  {categoryIcons[category] || "📋"}
                </span>
                {category}
                <span className="text-sm font-normal text-slate-500">
                  ({items.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((occ) => (
                    <Link
                      key={occ.slug}
                      href={`/salary/${occ.slug}`}
                      className="group flex items-center justify-between bg-dark-card border border-dark-border rounded-lg px-4 py-3 hover:border-slate-600 hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                        {occ.title}
                      </span>
                      <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0 ml-2">
                        ${(occ.baseUSA / 1000).toFixed(0)}K
                      </span>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full text-sm transition-colors"
          >
            Compare your own salary
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
